/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import constants from "../constants";

const initialState = {
  activeEventNames: [],
  listeners: [],
  fetchingListeners: false,
};

export function update(state = initialState, action, emit) {
  switch (action.type) {
    case constants.UPDATE_EVENT_BREAKPOINTS:
      state.activeEventNames = action.eventNames;
      // emit("activeEventNames", state.activeEventNames);
      break;
    case constants.FETCH_EVENT_LISTENERS:
      if (action.status === "begin") {
        state.fetchingListeners = true;
      } else if (action.status === "done") {
        state.fetchingListeners = false;
        state.listeners = action.listeners;
      }
      break;
    case constants.NAVIGATE:
      return initialState;
  }

  return state;
}

export function getEventListeners(state) {
  return state.eventListeners.listeners;
}
