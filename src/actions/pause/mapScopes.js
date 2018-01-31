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

import type {
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "debugger-html";

import type { ThunkArgs } from "../types";

export function mapScopes(scopes: Promise<Scope>, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    dispatch({
      type: "MAP_SCOPES",
      frame,
      [PROMISE]: (async function() {
        const sourceRecord = getSource(getState(), frame.location.sourceId);
        await dispatch(loadSourceText(sourceRecord));

        let mappedScopes;
        try {
          mappedScopes = await buildMappedScopes(
            sourceRecord.toJS(),
            frame,
            await scopes,
            sourceMaps
          );
        } catch (e) {
          mappedScopes = null;
        }

        return mappedScopes || scopes;
      })()
    });
  };
}

async function buildMappedScopes(
  source: Source,
  frame: Frame,
  scopes: Scope,
  sourceMaps: any
): Promise<?RenderableScope> {
  const originalAstScopes = await getScopes(frame.location);
  const generatedAstScopes = await getScopes(frame.generatedLocation);

  if (!originalAstScopes || !generatedAstScopes) {
    return null;
  }

  const generatedAstBindings = buildGeneratedBindingList(
    scopes,
    generatedAstScopes
  );

  const mappedOriginalScopes = await Promise.all(
    Array.from(originalAstScopes, async item => {
      const generatedBindings = {};

      await Promise.all(
        Object.keys(item.bindings).map(async name => {
          generatedBindings[name] = await findGeneratedBinding(
            sourceMaps,
            source,
            name,
            item.bindings[name],
            generatedAstBindings
          );
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
): RenderableScope {
  // Pull the root object scope and root lexical scope to reuse them in
  // our mapped scopes. This assumes that file file being processed is
  // a CommonJS or ES6 module, which might not be ideal. Potentially
  // should add some logic to try to detect those cases?
  let globalLexicalScope: ?RenderableScope = null;
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
    .reduce(
      (acc, orig, i): RenderableScope => ({
        // Flow doesn't like casting 'parent'.
        parent: (acc: any),
        actor: `originalActor${i}`,
        type: orig.type,
        bindings: {
          arguments: [],
          variables: orig.generatedBindings
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
      }),
      globalLexicalScope
    );

  return result;
}

async function findGeneratedBinding(
  sourceMaps: any,
  source: Source,
  name: string,
  originalBinding: BindingData,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<?BindingContents> {
  const { declarations, refs } = originalBinding;

  const genContent = await declarations
    .concat(refs)
    .reduce(async (acc, pos) => {
      const result = await acc;
      if (result) {
        return result;
      }

      const gen = await sourceMaps.getGeneratedLocation(pos.start, source);

      return generatedAstBindings.find(
        val =>
          val.loc.start.line === gen.line && val.loc.start.column === gen.column
      );
    }, null);

  if (genContent && !genContent.desc) {
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
  } else if (genContent) {
    // If `this` is just mapped back to the same `this`, then
    // we don't need to do any mapping for it at all.
    // if (name === "this" && !genContent.desc) return null;
    if (name === "this" && genContent.name === "this") {
      return null;
    }

    // If the location is found but the descriptor is not, then this
    // there is a bug. TODO to maybe log when this happens or something?
    // For now mark these with a special type, but we should
    // technically flag them.
    return genContent.desc;
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
  generatedAstScopes: SourceScope[]
): Array<GeneratedBindingLocation> {
  const clientScopes = [];
  for (let s = scopes; s; s = s.parent) {
    clientScopes.push(s);
  }

  const generatedBindings = clientScopes
    .reverse()
    .map((s, i) => ({
      generated: generatedAstScopes[generatedAstScopes.length - 1 - i],
      client: {
        ...s,
        bindings: s.bindings
          ? Object.assign({}, ...s.bindings.arguments, s.bindings.variables)
          : {}
      }
    }))
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
