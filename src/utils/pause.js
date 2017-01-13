// @flow
const { Frame } = require("../tcomb-types");
const { getOriginalLocation } = require("./source-map");

import type { Pause, Frame as FrameType } from "../types";

function updateFrameLocations(frames: FrameType[]): Promise<FrameType[]> {
  if (!frames) {
    return Promise.resolve(frames);
  }
  return Promise.all(
    frames.map(frame => {
      return getOriginalLocation(frame.location).then(loc => {
        return Frame.update(frame, {
          $merge: { location: loc }
        });
      });
    })
  );
}

// Map protocol pause "why" reason to a valid L10N key
// These are the known unhandled reasons:
// "breakpointConditionThrown", "clientEvaluated"
// "interrupted", "attached"
const reasons = {
  "debuggerStatement": "whyPaused.debuggerStatement",
  "breakpoint": "whyPaused.breakpoint",
  "exception": "whyPaused.exception",
  "resumeLimit": "whyPaused.resumeLimit",
  "pauseOnDOMEvents": "whyPaused.pauseOnDOMEvents",

  // V8 mappings
  "DOM": "whyPaused.v8.breakpoint",
  "EventListener": "whyPaused.v8.eventListener",
  "XHR": "whyPaused.v8.xhr",
  "exception": "whyPaused.v8.exception",
  "promiseRejection": "whyPaused.v8.promiseRejection",
  "assert": "whyPaused.v8.assert",
  "debugCommand": "whyPaused.v8.debugCommand",
  "other": "whyPaused.v8.other"
};

function getPauseReason(pauseInfo: Pause): string | null {
  if (!pauseInfo) {
    return null;
  }

  let reasonType = pauseInfo.getIn(["why"]).get("type");
  if (!reasons[reasonType]) {
    console.log("Please file an issue: reasonType=", reasonType);
  }
  return reasons[reasonType];
}

module.exports = {
  updateFrameLocations,
  getPauseReason
};
