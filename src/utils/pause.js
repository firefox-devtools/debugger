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

module.exports = {
  updateFrameLocations
};
