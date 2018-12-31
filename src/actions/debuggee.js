/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Action, ThunkArgs } from "./types";
import { closeTabsForMissingThreads } from "./tabs";
import { getMainThread } from "../reducers/pause";

export function updateWorkers() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    const { workers } = await client.fetchWorkers();
    dispatch(({ type: "SET_WORKERS", workers }: Action));

    closeTabsForMissingThreads(
      dispatch,
      getState,
      getMainThread(getState()),
      workers
    );
  };
}
