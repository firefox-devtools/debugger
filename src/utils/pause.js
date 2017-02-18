// @flow
const { getOriginalLocation } = require("devtools-source-map");

import type { Pause, Frame } from "../types";

function updateFrameLocations(frames: Frame[]): Promise<Frame[]> {
  if (!frames || frames.length == 0) {
    return Promise.resolve(frames);
  }

  return Promise.all(
    frames.map(frame => {
      return getOriginalLocation(frame.location).then(loc => {
        return Object.assign(frame, {
          location: loc
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
  "breakpointConditionThrown": "whyPaused.breakpointConditionThrown",

  // V8
  "DOM": "whyPaused.breakpoint",
  "EventListener": "whyPaused.pauseOnDOMEvents",
  "XHR": "whyPaused.xhr",
  "promiseRejection": "whyPaused.promiseRejection",
  "assert": "whyPaused.assert",
  "debugCommand": "whyPaused.debugCommand",
  "other": "whyPaused.other"
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
