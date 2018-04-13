/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { has } from "lodash";
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
import { locColumn } from "../../utils/pause/mapScopes/locColumn";

// eslint-disable-next-line max-len
import { findGeneratedBindingFromPosition } from "../../utils/pause/mapScopes/findGeneratedBindingFromPosition";

import { createObjectClient } from "../../client/firefox";

import { features } from "../../utils/prefs";
import { log } from "../../utils/log";
import { isGeneratedId } from "devtools-source-map";
import type {
  Position,
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "../../types";

import type { ThunkArgs } from "../types";

export type OriginalScope = RenderableScope;

export type GeneratedBindingLocation = {
  name: string,
  loc: BindingLocation,
  desc: () => Promise<BindingContents | null>
};

export function mapScopes(scopes: Promise<Scope>, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const generatedSourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    const sourceRecord = getSource(getState(), frame.location.sourceId);

    const shouldMapScopes =
      features.mapScopes &&
      !generatedSourceRecord.isWasm &&
      !sourceRecord.isPrettyPrinted &&
      !isGeneratedId(frame.location.sourceId);

    await dispatch({
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
            sourceMaps,
            client
          );
        } catch (e) {
          log(e);
          return null;
        }
      })()
    });
  };
}

function batchScopeMappings(
  originalAstScopes: Array<SourceScope>,
  source: Source,
  sourceMaps: any
) {
  const precalculatedRanges = new Map();
  const precalculatedLocations = new Map();

  // Explicitly dispatch all of the sourcemap requests synchronously up front so
  // that they will be batched into a single request for the worker to process.
  for (const item of originalAstScopes) {
    for (const name of Object.keys(item.bindings)) {
      for (const ref of item.bindings[name].refs) {
        const locs = [ref];
        if (ref.type === "decl") {
          locs.push(ref.declaration);
        }

        for (const loc of locs) {
          precalculatedRanges.set(
            buildLocationKey(loc.start),
            sourceMaps.getGeneratedRanges(loc.start, source)
          );
          precalculatedLocations.set(
            buildLocationKey(loc.start),
            sourceMaps.getGeneratedLocation(loc.start, source)
          );
          precalculatedLocations.set(
            buildLocationKey(loc.end),
            sourceMaps.getGeneratedLocation(loc.end, source)
          );
        }
      }
    }
  }

  return {
    async getGeneratedRanges(pos, s) {
      const key = buildLocationKey(pos);

      if (s !== source || !precalculatedRanges.has(key)) {
        log("Bad precalculated mapping");
        return sourceMaps.getGeneratedRanges(pos, s);
      }
      return precalculatedRanges.get(key);
    },
    async getGeneratedLocation(pos, s) {
      const key = buildLocationKey(pos);

      if (s !== source || !precalculatedLocations.has(key)) {
        log("Bad precalculated mapping");
        return sourceMaps.getGeneratedLocation(pos, s);
      }
      return precalculatedLocations.get(key);
    }
  };
}
function buildLocationKey(loc: Position): string {
  return `${loc.line}:${locColumn(loc)}`;
}

async function buildMappedScopes(
  source: Source,
  frame: Frame,
  scopes: Scope,
  sourceMaps: any,
  client: any
): Promise<?{
  mappings: {
    [string]: string
  },
  scope: OriginalScope
}> {
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

  const expressionLookup = {};
  const mappedOriginalScopes = [];

  const cachedSourceMaps = batchScopeMappings(
    originalAstScopes,
    source,
    sourceMaps
  );

  for (const item of originalAstScopes) {
    const generatedBindings = {};

    for (const name of Object.keys(item.bindings)) {
      const binding = item.bindings[name];

      const result = await findGeneratedBinding(
        cachedSourceMaps,
        client,
        source,
        name,
        binding,
        generatedAstBindings
      );

      if (result) {
        generatedBindings[name] = result.grip;

        if (
          binding.refs.length !== 0 &&
          // These are assigned depth-first, so we don't want shadowed
          // bindings in parent scopes overwriting the expression.
          !Object.prototype.hasOwnProperty.call(expressionLookup, name)
        ) {
          expressionLookup[name] = result.expression;
        }
      }
    }

    mappedOriginalScopes.push({
      ...item,
      generatedBindings
    });
  }

  const mappedGeneratedScopes = generateClientScope(
    scopes,
    mappedOriginalScopes
  );

  return isReliableScope(mappedGeneratedScopes)
    ? { mappings: expressionLookup, scope: mappedGeneratedScopes }
    : null;
}

/**
 * Consider a scope and its parents reliable if the vast majority of its
 * bindings were successfully mapped to generated scope bindings.
 */
function isReliableScope(scope: OriginalScope): boolean {
  let totalBindings = 0;
  let unknownBindings = 0;

  for (let s = scope; s; s = s.parent) {
    const vars = (s.bindings && s.bindings.variables) || {};
    for (const key of Object.keys(vars)) {
      const binding = vars[key];

      totalBindings += 1;
      if (
        binding.value &&
        typeof binding.value === "object" &&
        (binding.value.type === "unscoped" || binding.value.type === "unmapped")
      ) {
        unknownBindings += 1;
      }
    }
  }

  // As determined by fair dice roll.
  return totalBindings === 0 || unknownBindings / totalBindings < 0.9;
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
  client: any,
  source: Source,
  name: string,
  originalBinding: BindingData,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<?{
  grip: BindingContents,
  expression: string | null
}> {
  // If there are no references to the implicits, then we have no way to
  // even attempt to map it back to the original since there is no location
  // data to use. Bail out instead of just showing it as unmapped.
  if (
    originalBinding.type === "implicit" &&
    !originalBinding.refs.some(item => item.type === "ref")
  ) {
    return null;
  }

  const { refs } = originalBinding;

  const genContent = await refs.reduce(async (acc, pos) => {
    const result = await acc;
    if (result) {
      return result;
    }

    return await findGeneratedBindingFromPosition(
      sourceMaps,
      client,
      source,
      pos,
      name,
      originalBinding.type,
      generatedAstBindings
    );
  }, null);

  if (genContent && genContent.desc) {
    return {
      grip: genContent.desc,
      expression: genContent.expression
    };
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
      grip: {
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
      },
      expression: null
    };
  }

  // If no location mapping is found, then the map is bad, or
  // the map is okay but it original location is inside
  // of some scope, but the generated location is outside, leading
  // us to search for bindings that don't technically exist.
  return {
    grip: {
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
    },
    expression: null
  };
}

function buildGeneratedBindingList(
  scopes: Scope,
  generatedAstScopes: SourceScope[],
  thisBinding: ?BindingContents
): Array<GeneratedBindingLocation> {
  // The server's binding data doesn't include general 'this' binding
  // information, so we manually inject the one 'this' binding we have into
  // the normal binding data we are working with.
  const frameThisOwner = generatedAstScopes.find(
    generated => "this" in generated.bindings
  );

  let globalScope = null;
  const clientScopes = [];
  for (let s = scopes; s; s = s.parent) {
    const bindings = s.bindings
      ? Object.assign({}, ...s.bindings.arguments, s.bindings.variables)
      : {};

    clientScopes.push(bindings);
    globalScope = s;
  }

  const generatedMainScopes = generatedAstScopes.slice(0, -2);
  const generatedGlobalScopes = generatedAstScopes.slice(-2);

  const clientMainScopes = clientScopes.slice(0, generatedMainScopes.length);
  const clientGlobalScopes = clientScopes.slice(generatedMainScopes.length);

  // Map the main parsed script body using the nesting hierarchy of the
  // generated and client scopes.
  const generatedBindings = generatedMainScopes.reduce((acc, generated, i) => {
    const bindings = clientMainScopes[i];

    if (generated === frameThisOwner && thisBinding) {
      bindings.this = {
        value: thisBinding
      };
    }

    for (const name of Object.keys(generated.bindings)) {
      const { refs } = generated.bindings[name];
      for (const loc of refs) {
        acc.push({
          name,
          loc,
          desc: () => Promise.resolve(bindings[name] || null)
        });
      }
    }
    return acc;
  }, []);

  // Bindings in the global/lexical global of the generated code may or
  // may not be the real global if the generated code is running inside
  // of an evaled context. To handle this, we just look up the client scope
  // hierarchy to find the closest binding with that name.
  for (const generated of generatedGlobalScopes) {
    for (const name of Object.keys(generated.bindings)) {
      const { refs } = generated.bindings[name];
      const bindings = clientGlobalScopes.find(b => has(b, name));

      for (const loc of refs) {
        if (bindings) {
          generatedBindings.push({
            name,
            loc,
            desc: () => Promise.resolve(bindings[name])
          });
        } else {
          const globalGrip = globalScope && globalScope.object;
          if (globalGrip) {
            // Should always exist, just checking to keep Flow happy.

            generatedBindings.push({
              name,
              loc,
              desc: async () => {
                const objectClient = createObjectClient(globalGrip);
                return (await objectClient.getProperty(name)).descriptor;
              }
            });
          }
        }
      }
    }
  }

  // Sort so we can binary-search.
  return generatedBindings.sort((a, b) => {
    const aStart = a.loc.start;
    const bStart = b.loc.start;

    if (aStart.line === bStart.line) {
      return locColumn(aStart) - locColumn(bStart);
    }
    return aStart.line - bStart.line;
  });
}
