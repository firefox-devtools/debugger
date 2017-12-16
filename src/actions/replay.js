/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for replay
 * @module actions/replay
 */

import { getHistoryFrame } from "../selectors";

export function travelTo(index: any) {
  return ({ dispatch, getState }: any) => {
    console.log(index);
    const paused = getHistoryFrame(getState());
    return dispatch({
      type: "TRAVEL_TO",
      paused,
      index
    });
  };
}
