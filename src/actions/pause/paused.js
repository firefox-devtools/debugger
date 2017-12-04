/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression
} from "../../selectors";
import { updateFrameLocations } from "../../utils/pause";
import { removeBreakpoint } from "../breakpoints";
import { evaluateExpressions } from "../expressions";
import { selectLocation } from "../sources";
import { togglePaneCollapse } from "../ui";

import { fetchScopes } from "./fetchScopes";

import type { Pause } from "../../types";
import type { ThunkArgs } from "../types";

/**
 * Debugger has just paused
 *
 * @param {object} pauseInfo
 * @memberof actions/pause
 * @static
 */
export function paused(pauseInfo: Pause) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const { frames, why, loadedObjects } = pauseInfo;

    const mappedFrames = await updateFrameLocations(frames, sourceMaps);
    const frame = mappedFrames[0];

    dispatch({
      type: "PAUSED",
      pauseInfo: { why, frame, frames },
      frames: mappedFrames,
      selectedFrameId: frame.id,
      loadedObjects: loadedObjects || []
    });

    const hiddenBreakpointLocation = getHiddenBreakpointLocation(getState());
    if (hiddenBreakpointLocation) {
      dispatch(removeBreakpoint(hiddenBreakpointLocation));
    }

    if (!isEvaluatingExpression(getState())) {
      dispatch(evaluateExpressions());
    }

    await dispatch(selectLocation(frame.location));

    dispatch(togglePaneCollapse("end", false));
    dispatch(fetchScopes());
  };
}
