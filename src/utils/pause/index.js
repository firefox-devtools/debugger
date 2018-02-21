/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isEqual } from "lodash";
import { isOriginalId } from "devtools-source-map";
import type { Frame, Why } from "../../types";
import type { State } from "../../reducers/types";

import {
  getSelectedSource,
  getPreviousPauseFrameLocation
} from "../../selectors";
import { isInvalidPauseLocation } from "../../workers/parser";

export async function shouldStep(
  rootFrame: ?Frame,
  state: State,
  sourceMaps: any
) {
  if (!rootFrame) {
    return false;
  }

  const selectedSource = getSelectedSource(state);
  const previousFrameInfo = getPreviousPauseFrameLocation(state);

  let previousFrameLoc;
  let currentFrameLoc;

  if (selectedSource && isOriginalId(selectedSource.get("id"))) {
    currentFrameLoc = await sourceMaps.getOriginalLocation(rootFrame.location);
    previousFrameLoc = previousFrameInfo && previousFrameInfo.location;
  } else {
    currentFrameLoc = rootFrame.location;
    previousFrameLoc = previousFrameInfo && previousFrameInfo.generatedLocation;
  }

  return (
    isOriginalId(currentFrameLoc.sourceId) &&
    ((previousFrameLoc && isEqual(previousFrameLoc, currentFrameLoc)) ||
      (await isInvalidPauseLocation(currentFrameLoc)))
  );
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

export function getPauseReason(why?: Why): string | null {
  if (!why) {
    return null;
  }

  const reasonType = why.type;
  if (!reasons[reasonType]) {
    console.log("Please file an issue: reasonType=", reasonType);
  }
  return reasons[reasonType];
}

export function isException(why: Why) {
  return why && why.type && why.type === "exception";
}

export function isInterrupted(why: Why) {
  return why && why.type && why.type === "interrupted";
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
