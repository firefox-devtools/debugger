/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isGeneratedId } from "devtools-source-map";

import {
  getHiddenBreakpointLocation,
  isEvaluatingExpression,
  getSelectedFrame,
  getVisibleSelectedFrame,
  getSources
} from "../../selectors";

import { mapFrames } from ".";
import { removeBreakpoint } from "../breakpoints";
import { evaluateExpressions } from "../expressions";
import { selectLocation } from "../sources";
import { loadSourceText } from "../sources/loadSourceText";
import { togglePaneCollapse } from "../ui";
import { command } from "./commands";
import { shouldStep } from "../../utils/pause";

import { updateFrameLocation } from "./mapFrames";

import { fetchScopes } from "./fetchScopes";

import type { Pause, Frame } from "../../types";
import type { ThunkArgs } from "../types";

async function getOriginalSourceForFrame(state, frame: Frame) {
  return getSources(state).get(frame.location.sourceId);
}
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

    if (rootFrame) {
      const mappedFrame = await updateFrameLocation(rootFrame, sourceMaps);
      const source = await getOriginalSourceForFrame(getState(), mappedFrame);

      // Ensure that the original file has loaded if there is one.
      await dispatch(loadSourceText(source));

      if (await shouldStep(mappedFrame, getState(), sourceMaps)) {
        dispatch(command("stepOver"));
        return;
      }
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
    await dispatch(fetchScopes());

    // Run after fetching scoping data so that it may make use of the sourcemap
    // expression mappings for local variables.
    const atException = why.type == "exception";
    if (!atException || !isEvaluatingExpression(getState())) {
      await dispatch(evaluateExpressions());
    }
  };
}
