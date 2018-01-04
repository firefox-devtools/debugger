/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression,
  getSelectedFrame,
  getVisibleSelectedFrame
} from "../../selectors";
import { mapFrames } from ".";
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

    dispatch({
      type: "PAUSED",
      why,
      frames,
      selectedFrameId: frames[0].id,
      loadedObjects: loadedObjects || []
    });

    const hiddenBreakpointLocation = getHiddenBreakpointLocation(getState());
    if (hiddenBreakpointLocation) {
      dispatch(removeBreakpoint(hiddenBreakpointLocation));
    }

    if (!isEvaluatingExpression(getState())) {
      dispatch(evaluateExpressions());
    }

    await dispatch(mapFrames());
    const selectedFrame = getSelectedFrame(getState());
    const visibleFrame = getVisibleSelectedFrame(getState());

    if (
      visibleFrame &&
      visibleFrame.location.sourceId ===
        selectedFrame.generatedLocation.sourceId
    ) {
      await dispatch(selectLocation(selectedFrame.generatedLocation));
    } else {
      await dispatch(selectLocation(selectedFrame.location));
    }

    dispatch(togglePaneCollapse("end", false));
    dispatch(fetchScopes());
  };
}
