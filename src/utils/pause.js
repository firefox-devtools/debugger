/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import type { Pause, Frame, Location } from "../types";
import { get } from "lodash";
import { getScopes } from "../workers/parser";

import type { Scope, MappedScopeBindings, Why } from "debugger-html";

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

function extendScope(
  scope: ?Scope,
  generatedScopes: MappedScopeBindings[],
  index: number
): ?Scope {
  if (!scope) {
    return undefined;
  }
  if (index >= generatedScopes.length) {
    return scope;
  }
  return Object.assign({}, scope, {
    parent: extendScope(scope.parent, generatedScopes, index + 1),
    sourceBindings: generatedScopes[index].bindings
  });
}

export async function updateScopeBindings(
  scope: any,
  location: Location,
  sourceMaps: any
) {
  const astScopes = await getScopes(location);
  const generatedScopes = await sourceMaps.getLocationScopes(
    location,
    astScopes
  );
  if (!generatedScopes) {
    return scope;
  }
  return extendScope(scope, generatedScopes, 0);
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

export function inDebuggerEval(why: ?Why) {
  if (
    why &&
    why.type === "exception" &&
    why.exception &&
    why.exception.preview &&
    why.exception.preview.fileName
  ) {
    return why.exception.preview.fileName === "debugger eval code";
  }

  return false;
}
