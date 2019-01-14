/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { ThunkArgs } from "./types";
import { asyncStore } from "../utils/prefs";

export function addEventListeners(events: string[]) {
  return async ({ dispatch, client }: ThunkArgs) => {
    await dispatch({
      type: "ADD_EVENT_LISTENERS",
      events
    });
    const newList = await asyncStore.eventListenerBreakpoints;
    client.setEventListenerBreakpoints(newList);
  };
}

export function removeEventListeners(events: string[]) {
  return async ({ dispatch, client }: ThunkArgs) => {
    await dispatch({
      type: "REMOVE_EVENT_LISTENERS",
      events
    });
    const newList = await asyncStore.eventListenerBreakpoints;
    client.setEventListenerBreakpoints(newList);
  };
}
