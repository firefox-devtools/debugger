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
