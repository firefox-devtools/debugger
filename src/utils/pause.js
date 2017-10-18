// @flow
import type { Pause, Frame, Location } from "../types";
import { get } from "lodash";
import { getScopes } from "../workers/parser";

import type {
  Scope,
  SourceScope,
  MappedScopeBindings,
  SyntheticScope
} from "debugger-html";

export function updateFrameLocations(
  frames: Frame[],
  sourceMaps: any
): Promise<Frame[]> {
  if (!frames || frames.length == 0) {
    return Promise.resolve(frames);
  }

  return Promise.all(
    frames.map(frame =>
      sourceMaps.getOriginalLocation(frame.location).then(loc => ({
        ...frame,
        location: loc,
        generatedLocation: frame.location
      }))
    )
  );
}

type RemappedScope = {
  scopes: SyntheticScope[],
  start: number,
  end: number
};

function extendScope(
  scope: ?Scope,
  generatedScopes: MappedScopeBindings[],
  index: number,
  remapedScopes: ?(RemappedScope[]),
  remapedScopesIndex: number
): ?Scope {
  if (!scope) {
    return undefined;
  }
  if (index >= generatedScopes.length) {
    return scope;
  }

  let syntheticScopes;
  if (remapedScopes && remapedScopesIndex < remapedScopes.length) {
    if (index >= remapedScopes[remapedScopesIndex].end) {
      remapedScopesIndex++;
    }
    if (remapedScopesIndex < remapedScopes.length) {
      const remapedScope = remapedScopes[remapedScopesIndex];
      syntheticScopes = {
        scopes: remapedScope.scopes,
        groupIndex: index - remapedScope.start,
        groupLength: remapedScope.end - remapedScope.start
      };
    }
  }

  const parent = extendScope(
    scope.parent,
    generatedScopes,
    index + 1,
    remapedScopes,
    remapedScopesIndex
  );
  return Object.assign({}, scope, {
    parent,
    sourceBindings: generatedScopes[index].bindings,
    syntheticScopes
  });
}

// Performs mapping of the original parsed scopes to the locals mappings
// based on the generated source parse and source map data.
export function remapScopes(
  scopes: ?(SourceScope[]),
  generatedScopes: MappedScopeBindings[]
): ?(RemappedScope[]) {
  if (!scopes || scopes.length === 0) {
    return null;
  }
  // Chunk original source scopes on function/closure boundary
  const { result: scopeChunks } = scopes.reduce(
    ({ isLast, result }, scope) => {
      if (isLast) {
        result.push([]);
      }
      result[result.length - 1].push(scope);
      return {
        isLast: scope.type === "function",
        result
      };
    },
    { isLast: true, result: [] }
  );
  const { result: assigned } = scopeChunks.reduce(
    ({ result, searchIn, searchOffset }, scopeChunk) => {
      if (searchIn.length === 0) {
        return { result, searchIn, searchOffset };
      }
      // Process chunk of original parsed scopes: create used original names
      // binding summary per scope and entire chunk.
      const summarizedScopes = scopeChunk.map(({ type, bindings }) => ({
        type,
        bindingsNames: Object.keys(bindings)
      }));
      const names = summarizedScopes.reduce(
        (acc, { bindingsNames }) => acc.concat(bindingsNames),
        []
      );
      // ... and finding these names in the generated scopes (with mapped
      // original names) -- we need index of the last scope in the searchIn.
      let foundInMax = names.reduce((max, name) => {
        const index = searchIn.findIndex(s => name in s.bindings);
        return index < 0 ? Math.max(index, max) : max;
      }, 0);

      // TODO double check if names were not matched/found -- the source maps
      // and scope parsing can be broken.
      // Moving to the function bounary (in generated scopes).
      while (
        foundInMax + 1 < searchIn.length &&
        searchIn[foundInMax].type !== "function"
      ) {
        foundInMax++;
      }

      // We found chunk of the function(s) that matches the scopeChunk names.
      result.push({
        scopes: summarizedScopes,
        start: searchOffset,
        end: searchOffset + foundInMax + 1
      });

      // Consuming generated scopes mappings (searchIn).
      return {
        result,
        searchIn: searchIn.slice(foundInMax + 1),
        searchOffset: searchOffset + foundInMax + 1
      };
    },
    { result: [], searchIn: generatedScopes, searchOffset: 0 }
  );
  return assigned;
}

export async function updateScopeBindings(
  scope: any,
  location: Location,
  originalLocation: Location,
  sourceMaps: any
) {
  const astScopes: ?(SourceScope[]) = await getScopes(location);
  const generatedScopes = await sourceMaps.getLocationScopes(
    location,
    astScopes
  );
  if (!generatedScopes) {
    return scope;
  }
  const originalScopes = await getScopes(originalLocation);
  const remapedScopes = remapScopes(originalScopes, generatedScopes);
  return extendScope(scope, generatedScopes, 0, remapedScopes, 0);
}

// Map protocol pause "why" reason to a valid L10N key
// These are the known unhandled reasons:
// "breakpointConditionThrown", "clientEvaluated"
// "interrupted", "attached"
const reasons = {
  debuggerStatement: "whyPaused.debuggerStatement",
  breakpoint: "whyPaused.breakpoint",
  exception: "whyPaused.exception",
  resumeLimit: "whyPaused.resumeLimit",
  pauseOnDOMEvents: "whyPaused.pauseOnDOMEvents",
  breakpointConditionThrown: "whyPaused.breakpointConditionThrown",

  // V8
  DOM: "whyPaused.breakpoint",
  EventListener: "whyPaused.pauseOnDOMEvents",
  XHR: "whyPaused.xhr",
  promiseRejection: "whyPaused.promiseRejection",
  assert: "whyPaused.assert",
  debugCommand: "whyPaused.debugCommand",
  other: "whyPaused.other"
};

export function getPauseReason(pauseInfo: Pause): string | null {
  if (!pauseInfo) {
    return null;
  }

  const reasonType = get(pauseInfo, "why.type", null);
  if (!reasons[reasonType]) {
    console.log("Please file an issue: reasonType=", reasonType);
  }
  return reasons[reasonType];
}

export async function getPausedPosition(pauseInfo: Pause, sourceMaps: any) {
  let { frames } = pauseInfo;
  frames = await updateFrameLocations(frames, sourceMaps);
  const frame = frames[0];
  const { location } = frame;
  return location;
}
