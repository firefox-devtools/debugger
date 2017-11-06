// @flow

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression
} from "../../selectors";
import { updateFrameLocations } from "../../utils/pause";
import { removeBreakpoint } from "../breakpoints";
import { evaluateExpressions } from "../expressions";
import { selectSource } from "../sources";
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

    const { line, column } = frame.location;
    await dispatch(selectSource(frame.location.sourceId, { line, column }));

    dispatch(togglePaneCollapse("end", false));
    dispatch(fetchScopes());
  };
}
