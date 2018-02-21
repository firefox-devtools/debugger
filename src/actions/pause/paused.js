/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isEqual } from "lodash";
import { isGeneratedId, isOriginalId } from "devtools-source-map";
import { isInvalidPauseLocation } from "../../workers/parser";

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression,
  getSelectedFrame,
  getSelectedSource,
  getVisibleSelectedFrame,
  getPreviousPauseFrameLocation
} from "../../selectors";

import { mapFrames } from ".";
import { removeBreakpoint } from "../breakpoints";
import { evaluateExpressions } from "../expressions";
import { selectLocation } from "../sources";
import { togglePaneCollapse } from "../ui";
import { command } from "./commands";
// NOTE: we might want to move utils/pause.js into utils/pause/index... so we can replace the `pause/index` with `pause`
import { shouldStep } from "../../utils/pause/index";

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
    const rootFrame = frames.length > 0 ? frames[0] : null;

    if (await shouldStep(rootFrame, getState(), sourceMaps)) {
      dispatch(command("stepOver"));
      return;
    }

    dispatch({
      type: "PAUSED",
      why,
      frames,
      selectedFrameId: rootFrame ? rootFrame.id : undefined,
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

    if (selectedFrame) {
      const visibleFrame = getVisibleSelectedFrame(getState());
      const location = isGeneratedId(visibleFrame.location.sourceId)
        ? selectedFrame.generatedLocation
        : selectedFrame.location;
      await dispatch(selectLocation(location));
    }

    dispatch(togglePaneCollapse("end", false));
    dispatch(fetchScopes());
  };
}
