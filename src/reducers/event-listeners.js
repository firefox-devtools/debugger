/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { asyncStore } from "../utils/prefs";
import { uniq } from "lodash";

function update(state = [], action) {
  console.log("event listener update! ", state, action);
  switch (action.type) {
    case "ADD_EVENT_LISTENERS":
      return updateEventTypes("add", state, action.events);

    case "REMOVE_EVENT_LISTENERS":
      return updateEventTypes("remove", state, action.events);

    default:
      return state;
  }
}

function updateEventTypes(addOrRemove, currentEvents, events) {
  let newEventListeners;

  console.log("updateEventTypes: ", addOrRemove, currentEvents, events);
  if (addOrRemove === "add") {
    newEventListeners = uniq([...currentEvents, ...events]);
  } else {
    newEventListeners = currentEvents.filter(event => !events.includes(event));
  }

  asyncStore.eventListenerBreakpoints = newEventListeners;
  return newEventListeners;
}

export function getActiveEventListeners(state) {
  return state.eventListenerBreakpoints;
}

export default update;
