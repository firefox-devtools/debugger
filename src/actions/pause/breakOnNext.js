/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { ThunkArgs } from "../types";

/**
 * Debugger breakOnNext command.
 * It's different from the command action because we also want to
 * highlight the pause icon.
 *
 * @memberof actions/pause
 * @static
 */
export function breakOnNext() {
  console.log("breakOnNext()");
  return ({ dispatch, client }: ThunkArgs) => {
    client.breakOnNext();

    return dispatch({
      type: "BREAK_ON_NEXT",
      value: true
    });
  };
}
