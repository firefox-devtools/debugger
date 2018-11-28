/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getScopes,
  type SourceScope,
  type BindingData,
  type BindingLocation
} from "../../../workers/parser";
import type { RenderableScope } from "../scopes/getScope";
import { locColumn } from "./locColumn";
import {
  loadRangeMetadata,
  findMatchingRange,
  type MappedOriginalRange
} from "./rangeMetadata";

// eslint-disable-next-line max-len
import {
  findGeneratedReference,
  findGeneratedImportReference,
  findGeneratedImportDeclaration,
  type GeneratedDescriptor
} from "./findGeneratedBindingFromPosition";
import {
  buildGeneratedBindingList,
  type GeneratedBindingLocation
} from "./buildGeneratedBindingList";
import {
  originalRangeStartsInside,
  getApplicableBindingsForOriginalPosition
} from "./getApplicableBindingsForOriginalPosition";

import { log } from "../../log";
import type {
  PartialPosition,
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "../../../types";

export type OriginalScope = RenderableScope;

export async function buildMappedScopes(
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

  const originalRanges = await loadRangeMetadata(
    source,
    frame,
    originalAstScopes,
    sourceMaps
  );

  if (hasLineMappings(originalRanges)) {
    return null;
  }

  const generatedAstBindings = buildGeneratedBindingList(
    scopes,
    generatedAstScopes,
    frame.this
  );

  const {
    mappedOriginalScopes,
    expressionLookup
  } = await mapOriginalBindingsToGenerated(
    source,
    originalRanges,
    originalAstScopes,
    generatedAstBindings,
    client,
    sourceMaps
  );

  const mappedGeneratedScopes = generateClientScope(
    scopes,
    mappedOriginalScopes
  );

  return isReliableScope(mappedGeneratedScopes)
    ? { mappings: expressionLookup, scope: mappedGeneratedScopes }
    : null;
}

async function mapOriginalBindingsToGenerated(
  source: Source,
  originalRanges: Array<MappedOriginalRange>,
  originalAstScopes,
  generatedAstBindings,
  client,
  sourceMaps
) {
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
        originalRanges,
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

  return {
    mappedOriginalScopes,
    expressionLookup
  };
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
  return totalBindings === 0 || unknownBindings / totalBindings < 0.25;
}

function hasLineMappings(ranges) {
  return ranges.every(
    range => range.columnStart === 0 && range.columnEnd === Infinity
  );
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
        if (ref.type !== "ref") {
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
function buildLocationKey(loc: PartialPosition): string {
  return `${loc.line}:${locColumn(loc)}`;
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
        parent: acc,
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
  if (result.bindings && thisScope) {
    result.bindings.this = thisScope.generatedBindings.this || null;
  }

  return result;
}

function hasValidIdent(range: MappedOriginalRange, pos: BindingLocation) {
  return (
    range.type === "match" ||
    // For declarations, we allow the range on the identifier to be a
    // more general "contains" to increase the chances of a match.
    (pos.type !== "ref" && range.type === "contains")
  );
}

// eslint-disable-next-line complexity
async function findGeneratedBinding(
  sourceMaps: any,
  client: any,
  source: Source,
  name: string,
  originalBinding: BindingData,
  originalRanges: Array<MappedOriginalRange>,
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

  const loadApplicableBindings = async (pos, locationType) => {
    let applicableBindings = await getApplicableBindingsForOriginalPosition(
      generatedAstBindings,
      source,
      pos,
      originalBinding.type,
      locationType,
      sourceMaps
    );
    if (applicableBindings.length > 0) {
      hadApplicableBindings = true;
    }
    if (locationType === "ref") {
      // Some tooling creates ranges that map a line as a whole, which is useful
      // for step-debugging, but can easily lead to finding the wrong binding.
      // To avoid these false-positives, we entirely ignore bindings matched
      // by ranges that cover full lines.
      applicableBindings = applicableBindings.filter(
        ({ range }) =>
          !(range.start.column === 0 && range.end.column === Infinity)
      );
    }
    if (
      locationType !== "ref" &&
      !(await originalRangeStartsInside(source, pos, sourceMaps))
    ) {
      applicableBindings = [];
    }
    return applicableBindings;
  };

  const { refs } = originalBinding;

  let hadApplicableBindings = false;
  let genContent: GeneratedDescriptor | null = null;
  for (const pos of refs) {
    const applicableBindings = await loadApplicableBindings(pos, pos.type);

    const range = findMatchingRange(originalRanges, pos);
    if (range && hasValidIdent(range, pos)) {
      if (originalBinding.type === "import") {
        genContent = await findGeneratedImportReference(applicableBindings);
      } else {
        genContent = await findGeneratedReference(applicableBindings);
      }
    }

    if (
      (pos.type === "class-decl" || pos.type === "class-inner") &&
      source.contentType &&
      source.contentType.match(/\/typescript/)
    ) {
      const declRange = findMatchingRange(originalRanges, pos.declaration);
      if (declRange && declRange.type !== "multiple") {
        const applicableDeclBindings = await loadApplicableBindings(
          pos.declaration,
          pos.type
        );

        // Resolve to first binding in the range
        const declContent = await findGeneratedReference(
          applicableDeclBindings
        );

        if (declContent) {
          // Prefer the declaration mapping in this case because TS sometimes
          // maps class declaration names to "export.Foo = Foo;" or to
          // the decorator logic itself
          genContent = declContent;
        }
      }
    }

    if (
      !genContent &&
      pos.type === "import-decl" &&
      typeof pos.importName === "string"
    ) {
      const { importName } = pos;
      const declRange = findMatchingRange(originalRanges, pos.declaration);

      // The import declaration should have an original position mapping,
      // but otherwise we don't really have preferences on the range type
      // because it can have multiple bindings, but we do want to make sure
      // that all of the bindings that match the range are part of the same
      // import declaration.
      if (declRange && declRange.singleDeclaration) {
        const applicableDeclBindings = await loadApplicableBindings(
          pos.declaration,
          pos.type
        );

        // match the import declaration location
        genContent = await findGeneratedImportDeclaration(
          applicableDeclBindings,
          importName
        );
      }
    }

    if (genContent) {
      break;
    }
  }

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
  } else if (!hadApplicableBindings && name !== "this") {
    // If there were no applicable bindings to consider while searching for
    // matching bindings, then the source map for this file didn't make any
    // attempt to map the binding, and that most likely means that the
    // code was entirely emitted from the output code.
    return {
      grip: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: {
          type: "null",
          optimizedOut: true
        }
      },
      expression: `
        (() => {
          throw new Error('"' + ${JSON.stringify(
            name
          )} + '" has been optimized out.');
        })()
      `
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
