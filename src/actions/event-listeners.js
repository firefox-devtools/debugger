/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export function addEventListeners(events: String[]) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: "ADD_EVENT_LISTENERS",
      events
    });
  };
}

export function removeEventListeners(events: String[]) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: "REMOVE_EVENT_LISTENERS",
      events
    });
  };
}
