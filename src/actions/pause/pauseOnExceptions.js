// @flow

import { PROMISE } from "../utils/middleware/promise";
import type { ThunkArgs } from "../types";

/**
 *
 * @memberof actions/pause
 * @static
 */
export function pauseOnExceptions(
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean
) {
  return ({ dispatch, client }: ThunkArgs) => {
    dispatch({
      type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      [PROMISE]: client.pauseOnExceptions(
        shouldPauseOnExceptions,
        shouldIgnoreCaughtExceptions
      )
    });
  };
}
