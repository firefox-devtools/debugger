/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isPaused, pausedInEval, isStepping } from "../../selectors";
import { evaluateExpressions } from "../expressions";

import type { ThunkArgs } from "../types";

/**
 * Debugger has just resumed
 *
 * @memberof actions/pause
 * @static
 */
export function resumed() {
  return ({ dispatch, client, getState }: ThunkArgs) => {
    if (!isPaused(getState())) {
      return;
    }

    const wasPausedInEval = pausedInEval(getState());

    dispatch({
      type: "RESUME",
      value: undefined
    });

    if (!isStepping(getState()) && !wasPausedInEval) {
      dispatch(evaluateExpressions());
    }
  };
}
