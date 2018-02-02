// @flow

import { getFrames } from "../../selectors";

import type { Frame } from "../../types";
import type { ThunkArgs } from "../types";

function updateFrameLocation(frame: Frame, sourceMaps: any) {
  return sourceMaps.getOriginalLocation(frame.location).then(loc => ({
    ...frame,
    location: loc,
    generatedLocation: frame.generatedLocation || frame.location
  }));
}

function updateFrameLocations(
  frames: Frame[],
  sourceMaps: any
): Promise<Frame[]> {
  if (!frames || frames.length == 0) {
    return Promise.resolve(frames);
  }

  return Promise.all(
    frames.map(frame => updateFrameLocation(frame, sourceMaps))
  );
}

/**
 * Map call stack frame locations to original locations.
 * e.g.
 * 1. When the debuggee pauses
 * 2. When a source is pretty printed
 *
 * @memberof actions/pause
 * @static
 */
export function mapFrames() {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const frames = getFrames(getState());
    if (!frames) {
      return;
    }

    const mappedFrames = await updateFrameLocations(frames, sourceMaps);

    dispatch({
      type: "MAP_FRAMES",
      frames: mappedFrames
    });
  };
}
