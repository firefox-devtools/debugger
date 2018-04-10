/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for replay
 * @module actions/replay
 */

import { getHistoryFrame } from "../selectors";
import { selectLocation } from "./sources";

import type { Action } from "./types";

export function timeTravelTo(position: number) {
  return ({ dispatch, getState }: any) => {
    const data = getHistoryFrame(getState(), position);
    dispatch(
      ({
        type: "TRAVEL_TO",
        data,
        position
      }: Action)
    );
    dispatch(selectLocation(data.paused.frames[0].location));
  };
}

export function clearHistory() {
  return ({ dispatch, getState }: any) => {
    dispatch({
      type: "CLEAR_HISTORY"
    });
  };
}
