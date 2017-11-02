// @flow

import type { ThunkArgs } from "../types";

/**
 * Debugger breakOnNext command.
 * It's different from the comand action because we also want to
 * highlight the pause icon.
 *
 * @memberof actions/pause
 * @static
 */
export function breakOnNext() {
  return ({ dispatch, client }: ThunkArgs) => {
    client.breakOnNext();

    return dispatch({
      type: "BREAK_ON_NEXT",
      value: true
    });
  };
}
