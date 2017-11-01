// @flow
import {
  isPaused,
  pausedInEval,
  isStepping,
  getPauseHistory
} from "../../selectors";
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
    const pause = getPauseHistory(getState())[0];
    const wasPausedInEval = inDebuggerEval(pause);

    if (!isStepping(getState()) && !wasPausedInEval) {
      await dispatch(evaluateExpressions());
    }
  };
}
