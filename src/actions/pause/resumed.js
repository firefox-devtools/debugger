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
    if (!isStepping(getState())) {
      dispatch(evaluateExpressions());
    }
  };
}
