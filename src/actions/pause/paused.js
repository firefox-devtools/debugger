// @flow

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression
} from "../../selectors";
import { updateFrameLocations } from "../../utils/pause";
import { removeBreakpoint } from "../breakpoints";
import { evaluateExpressions } from "../expressions";
import { selectSource } from "../sources";
import { mapScopes } from "./mapScopes";

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
    const frameScopes = await client.getFrameScopes(frame);

    dispatch({
      type: "PAUSED",
      pauseInfo: { why, frame, frames },
      frames: mappedFrames,
      scopes: frameScopes,
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

    await dispatch(
      selectSource(frame.location.sourceId, { line: frame.location.line })
    );

    dispatch(mapScopes());
  };
}
