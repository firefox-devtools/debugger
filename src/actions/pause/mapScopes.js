/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSource } from "../../selectors";
import { loadSourceText } from "../sources/loadSourceText";
import {
  getScopes,
  type SourceScope,
  type BindingData,
  type BindingLocation
} from "../../workers/parser";
import type { RenderableScope } from "../../utils/pause/scopes/getScope";
import { PROMISE } from "../utils/middleware/promise";

import { features } from "../../utils/prefs";
import { isGeneratedId } from "devtools-source-map";
import type {
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "../../types";

import type { ThunkArgs } from "../types";

export type OriginalScope = RenderableScope;

export function mapScopes(scopes: Promise<Scope>, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const generatedSourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    const sourceRecord = getSource(getState(), frame.location.sourceId);

    const shouldMapScopes =
      features.mapScopes &&
      !generatedSourceRecord.get("isWasm") &&
      !sourceRecord.get("isPrettyPrinted") &&
      !isGeneratedId(frame.location.sourceId);

    dispatch({
      type: "MAP_SCOPES",
      frame,
      [PROMISE]: (async function() {
        if (!shouldMapScopes) {
          return null;
        }

        await dispatch(loadSourceText(sourceRecord));

        try {
          return await buildMappedScopes(
            sourceRecord.toJS(),
            frame,
            await scopes,
            sourceMaps
          );
        } catch (e) {
          return null;
        }
      })()
    });
  };
}

async function buildMappedScopes(
  source: Source,
  frame: Frame,
  scopes: Scope,
  sourceMaps: any
): Promise<?OriginalScope> {
  const originalAstScopes = await getScopes(frame.location);
  const generatedAstScopes = await getScopes(frame.generatedLocation);

  if (!originalAstScopes || !generatedAstScopes) {
    return null;
  }

  const generatedAstBindings = buildGeneratedBindingList(
    scopes,
    generatedAstScopes,
    frame.this
  );

  const mappedOriginalScopes = await Promise.all(
    Array.from(originalAstScopes, async item => {
      const generatedBindings = {};

      await Promise.all(
        Object.keys(item.bindings).map(async name => {
          const binding = item.bindings[name];

          const result = await findGeneratedBinding(
            sourceMaps,
            source,
            name,
            binding,
            generatedAstBindings
          );

          if (result) {
            generatedBindings[name] = result;
          }
        })
      );

      return {
        ...item,
        generatedBindings
      };
    })
  );

  return generateClientScope(scopes, mappedOriginalScopes);
}

function generateClientScope(
  scopes: Scope,
  originalScopes: Array<SourceScope & { generatedBindings: ScopeBindings }>
): OriginalScope {
  // Pull the root object scope and root lexical scope to reuse them in
  // our mapped scopes. This assumes that file file being processed is
  // a CommonJS or ES6 module, which might not be ideal. Potentially
  // should add some logic to try to detect those cases?
  let globalLexicalScope: ?OriginalScope = null;
  for (let s = scopes; s.parent; s = s.parent) {
    // $FlowIgnore - Flow doesn't like casting 'parent'.
    globalLexicalScope = s;
  }
  if (!globalLexicalScope) {
    throw new Error("Assertion failure - there should always be a scope");
  }

  // Build a structure similar to the client's linked scope object using
  // the original AST scopes, but pulling in the generated bindings
  // linked to each scope.
  const result = originalScopes
    .slice(0, -2)
    .reverse()
    .reduce((acc, orig, i): OriginalScope => {
      const {
        // The 'this' binding data we have is handled independently, so
        // the binding data is not included here.
        // eslint-disable-next-line no-unused-vars
        this: _this,
        ...variables
      } = orig.generatedBindings;

      return {
        // Flow doesn't like casting 'parent'.
        parent: (acc: any),
        actor: `originalActor${i}`,
        type: orig.type,
        bindings: {
          arguments: [],
          variables
        },
        ...(orig.type === "function"
          ? {
              function: {
                displayName: orig.displayName
              }
            }
          : null),
        ...(orig.type === "block"
          ? {
              block: {
                displayName: orig.displayName
              }
            }
          : null)
      };
    }, globalLexicalScope);

  // The rendering logic in getScope 'this' bindings only runs on the current
  // selected frame scope, so we pluck out the 'this' binding that was mapped,
  // and put it in a special location
  const thisScope = originalScopes.find(scope => scope.bindings.this);
  if (thisScope) {
    result.bindings.this = thisScope.generatedBindings.this || null;
  }

  return result;
}

async function findGeneratedBinding(
  sourceMaps: any,
  source: Source,
  name: string,
  originalBinding: BindingData,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<?BindingContents> {
  // If there are no references to the implicits, then we have no way to
  // even attempt to map it back to the original since there is no location
  // data to use. Bail out instead of just showing it as unmapped.
  if (
    originalBinding.type === "implicit" &&
    originalBinding.refs.length === 0
  ) {
    return null;
  }

  const { declarations, refs } = originalBinding;

  const genContent = await declarations
    .concat(refs)
    .reduce(async (acc, pos) => {
      const result = await acc;
      if (result) {
        return result;
      }

      const gen = await sourceMaps.getGeneratedLocation(pos.start, source);
      const genEnd = await sourceMaps.getGeneratedLocation(pos.end, source);

      // Since the map takes the closest location, sometimes mapping a
      // binding's location can point at the start of a binding listed after
      // it, so we need to make sure it maps to a location that actually has
      // a size in order to avoid picking up the wrong descriptor.
      if (gen.line === genEnd.line && gen.column === genEnd.column) {
        return null;
      }

      return generatedAstBindings.find(val => {
        if (val.loc.start.line !== gen.line) {
          return false;
        }

        // Allow the mapping to point anywhere within the generated binding
        // location to allow for less than perfect sourcemaps. Since you also
        // need at least one character between identifiers, we also give one
        // characters of space at the front the generated binding in order
        // to increase the probability of finding the right mapping.
        const start = val.loc.start.column - 1;
        const end = val.loc.end.column;
        return gen.column >= start && gen.column <= end;
      });
    }, null);

  if (genContent && genContent.desc) {
    return genContent.desc;
  } else if (genContent) {
    // If there is no descriptor for 'this', then this is not the top-level
    // 'this' that the server gave us a binding for, and we can just ignore it.
    if (name === "this") {
      return null;
    }

    // If the location is found but the descriptor is not, then it
    // means that the server scope information didn't match the scope
    // information from the DevTools parsed scopes.
    return {
      configurable: false,
      enumerable: true,
      writable: false,
      value: {
        type: "unscoped",
        unscoped: true,

        // HACK: Until support for "unscoped" lands in devtools-reps,
        // this will make these show as (unavailable).
        missingArguments: true
      }
    };
  }

  // If no location mapping is found, then the map is bad, or
  // the map is okay but it original location is inside
  // of some scope, but the generated location is outside, leading
  // us to search for bindings that don't technically exist.
  return {
    configurable: false,
    enumerable: true,
    writable: false,
    value: {
      type: "unmapped",
      unmapped: true,

      // HACK: Until support for "unmapped" lands in devtools-reps,
      // this will make these show as (unavailable).
      missingArguments: true
    }
  };
}

type GeneratedBindingLocation = {
  name: string,
  loc: BindingLocation,
  desc: BindingContents | null
};

function buildGeneratedBindingList(
  scopes: Scope,
  generatedAstScopes: SourceScope[],
  thisBinding: ?BindingContents
): Array<GeneratedBindingLocation> {
  const clientScopes = [];
  for (let s = scopes; s; s = s.parent) {
    clientScopes.push(s);
  }

  // The server's binding data doesn't include general 'this' binding
  // information, so we manually inject the one 'this' binding we have into
  // the normal binding data we are working with.
  const frameThisOwner = generatedAstScopes.find(
    generated => "this" in generated.bindings
  );

  const generatedBindings = clientScopes
    .reverse()
    .map((s, i) => {
      const generated = generatedAstScopes[generatedAstScopes.length - 1 - i];

      const bindings = s.bindings
        ? Object.assign({}, ...s.bindings.arguments, s.bindings.variables)
        : {};

      if (generated === frameThisOwner && thisBinding) {
        bindings.this = {
          value: thisBinding
        };
      }

      return {
        generated,
        client: {
          ...s,
          bindings
        }
      };
    })
    .slice(2)
    .reduce((acc, { client: { bindings }, generated }) => {
      // If the parser worker's result didn't match the client scopes,
      // there might not be a generated scope that matches.
      if (generated) {
        for (const name of Object.keys(generated.bindings)) {
          const { declarations, refs } = generated.bindings[name];
          for (const loc of declarations.concat(refs)) {
            acc.push({
              name,
              loc,
              desc: bindings[name] || null
            });
          }
        }
      }
      return acc;
    }, [])
    // Sort so we can binary-search.
    .sort((a, b) => {
      const aStart = a.loc.start;
      const bStart = a.loc.start;

      if (aStart.line === bStart.line) {
        if (
          typeof aStart.column !== "number" ||
          typeof bStart.column !== "number"
        ) {
          // This shouldn't really happen with locations from the AST, but
          // the datatype we are using allows null/undefined column.
          return 0;
        }

        return aStart.column - bStart.column;
      }
      return aStart.line - bStart.line;
    });

  return generatedBindings;
}
