/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "../utils/middleware/promise";
import type { Source } from "../../types";
import type { Action, ThunkArgs } from "../types";

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed, id } = source;

    return dispatch(
      ({
        type: "BLACKBOX",
        source,
        [PROMISE]: client.blackBox(id, isBlackBoxed)
      }: Action)
    );
  };
}
