/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getFrames, getSymbols, getSource } from "../../selectors";
import { findClosestFunction } from "../../utils/ast";

import type { Frame } from "../../types";
import type { State } from "../../reducers/types";
import type { ThunkArgs } from "../types";

export function updateFrameLocation(frame: Frame, sourceMaps: any) {
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

export function mapDisplayNames(frames: Frame[], getState: () => State) {
  return frames.map(frame => {
    const source = getSource(getState(), frame.location.sourceId);
    const symbols = getSymbols(getState(), source);

    if (!symbols || !symbols.functions) {
      return frame;
    }

    const originalFunction = findClosestFunction(symbols, frame.location);

    if (!originalFunction) {
      return frame;
    }

    const originalDisplayName = originalFunction.name;
    return { ...frame, originalDisplayName };
  });
}

/**
 * Map call stack frame locations and display names to originals.
 * e.g.
 * 1. When the debuggee pauses
 * 2. When a source is pretty printed
 * 3. When symbols are loaded
 * @memberof actions/pause
 * @static
 */
export function mapFrames() {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const frames = getFrames(getState());
    if (!frames) {
      return;
    }

    let mappedFrames = await updateFrameLocations(frames, sourceMaps);
    mappedFrames = mapDisplayNames(mappedFrames, getState);

    dispatch({
      type: "MAP_FRAMES",
      frames: mappedFrames
    });
  };
}
