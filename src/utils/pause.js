/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import type { Pause, Frame, Location } from "../types";
import { get } from "lodash";
import { getScopes } from "../workers/parser";
// eslint-disable-next-line max-len
import { updateScopeBindings as coreUpdateScopeBindings } from "devtools-map-bindings/src/updateScopeBindings";

import type {
  MappedScopeBindings,
  Scope,
  SourceId,
  SourceScope,
  Why
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

type UpdateScopeBindingsContextArg = {
  getLocationScopes: (
    location: Location,
    astScopes: ?(SourceScope[])
  ) => Promise<MappedScopeBindings[] | null>,
  loadSourceText: (sourceId: SourceId) => Promise<any>
};

export async function updateScopeBindings(
  scope: ?Scope,
  generatedLocation: Location,
  originalLocation: Location,
  { getLocationScopes, loadSourceText }: UpdateScopeBindingsContextArg
): Promise<?Scope> {
  return coreUpdateScopeBindings(scope, generatedLocation, originalLocation, {
    async getSourceMapsScopes(location) {
      const astScopes: ?(SourceScope[]) = await getScopes(location);
      return getLocationScopes(location, astScopes);
    },
    async getOriginalSourceScopes(location) {
      await loadSourceText(location.sourceId);
      return getScopes(location);
    }
  });
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
