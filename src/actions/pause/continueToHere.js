/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getSelectedSource,
  getSelectedFrame,
  getCanRewind
} from "../../selectors";
import { addHiddenBreakpoint } from "../breakpoints";
import { resume, rewind } from "./commands";

import type { ThunkArgs } from "../types";

export function continueToHere(line: number) {
  return async function({ dispatch, getState }: ThunkArgs) {
    const selectedSource = getSelectedSource(getState());
    const selectedFrame = getSelectedFrame(getState());

    if (!selectedFrame || !selectedSource) {
      return;
    }

    const debugLine = selectedFrame.location.line;
    if (debugLine == line) {
      return;
    }

    const action =
      getCanRewind(getState()) && line < debugLine ? rewind : resume;

    await dispatch(
      addHiddenBreakpoint({
        line,
        column: undefined,
        sourceId: selectedSource.id
      })
    );

    dispatch(action());
  };
}
