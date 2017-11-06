// @flow
import { isStepping, getPauseReason } from "../../selectors";
import { evaluateExpressions } from "../expressions";
import { inDebuggerEval } from "../../utils/pause";

import type { ThunkArgs } from "../types";

/**
 * Debugger has just resumed
 *
 * @memberof actions/pause
 * @static
 */
export function resumed() {
  return async ({ dispatch, client, getState }: ThunkArgs) => {
    const why = getPauseReason(getState());
    const wasPausedInEval = inDebuggerEval(why);

    if (!isStepping(getState()) && !wasPausedInEval) {
      await dispatch(evaluateExpressions());
    }

    dispatch({
      type: "RESUME"
    });
  };
}
