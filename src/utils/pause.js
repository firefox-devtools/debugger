// @flow
const { Frame } = require("../tcomb-types");
const { getOriginalLocation } = require("./source-map");

import type { Frame as FrameType } from "../types";

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

const reasons = {
  "debuggerStatement": "Paused on a debugger; statement in the source code",
  "breakpoint": "Paused on a breakpoint"
};

function getPauseReason(pauseInfo) {
  if (!pauseInfo) {
    return null;
  }

  let reasonType = pauseInfo.getIn(["why"]).get("type");
  if (!reasons[reasonType]) {
    console.log("reasonType", reasonType);
  }
  return reasons[reasonType];
}

module.exports = {
  updateFrameLocations,
  getPauseReason
};
