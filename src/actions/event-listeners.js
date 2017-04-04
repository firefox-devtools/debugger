/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global window gThreadClient setNamedTimeout services EVENTS */
/* eslint no-shadow: 0  */

/**
 * Redux actions for the event listeners state
 * @module actions/event-listeners
 */

import constants from "../constants";
import { reportException } from "../utils/DevToolsUtils";
import { getPause, getSourceByURL } from "../selectors";

// delay is in ms
const FETCH_EVENT_LISTENERS_DELAY = 200;
let fetchListenersTimerID;

/**
 * @memberof utils/utils
 * @static
 */
async function asPaused(state: any, client: any, func: any) {
  if (!getPause(state)) {
    await client.interrupt();
    let result;

    try {
      result = await func(client);
    } catch (e) {
      // Try to put the debugger back in a working state by resuming
      // it
      await client.resume();
      throw e;
    }

    await client.resume();
    return result;
  }

  return func(client);
}

/**
 * @memberof actions/event-listeners
 * @static
 */
export function fetchEventListeners() {
  return ({ dispatch, getState, client }) => {
    // Make sure we"re not sending a batch of closely repeated requests.
    // This can easily happen whenever new sources are fetched.
    if (fetchListenersTimerID) {
      clearTimeout(fetchListenersTimerID);
    }

    fetchListenersTimerID = setTimeout(
      () => {
        // In case there is still a request of listeners going on (it
        // takes several RDP round trips right now), make sure we wait
        // on a currently running request
        if (getState().eventListeners.fetchingListeners) {
          dispatch({
            type: services.WAIT_UNTIL,
            predicate: action =>
              action.type === constants.FETCH_EVENT_LISTENERS &&
              action.status === "done",
            run: dispatch => dispatch(fetchEventListeners())
          });
          return;
        }

        dispatch({
          type: constants.FETCH_EVENT_LISTENERS,
          status: "begin"
        });

        asPaused(getState(), client, _getEventListeners).then(listeners => {
          dispatch({
            type: constants.FETCH_EVENT_LISTENERS,
            status: "done",
            listeners: formatListeners(getState(), listeners)
          });
        });
      },
      FETCH_EVENT_LISTENERS_DELAY
    );
  };
}

function formatListeners(state, listeners) {
  return listeners.map(l => {
    return {
      selector: l.node.selector,
      type: l.type,
      sourceId: getSourceByURL(state, l.function.location.url).get("id"),
      line: l.function.location.line
    };
  });
}

async function _getEventListeners(threadClient) {
  const response = await threadClient.eventListeners();

  // Make sure all the listeners are sorted by the event type, since
  // they"re not guaranteed to be clustered together.
  response.listeners.sort((a, b) => a.type > b.type ? 1 : -1);

  // Add all the listeners in the debugger view event linsteners container.
  let fetchedDefinitions = new Map();
  let listeners = [];
  for (let listener of response.listeners) {
    let definitionSite;
    if (fetchedDefinitions.has(listener.function.actor)) {
      definitionSite = fetchedDefinitions.get(listener.function.actor);
    } else if (listener.function.class == "Function") {
      definitionSite = await _getDefinitionSite(
        threadClient,
        listener.function
      );
      if (!definitionSite) {
        // We don"t know where this listener comes from so don"t show it in
        // the UI as breaking on it doesn"t work (bug 942899).
        continue;
      }

      fetchedDefinitions.set(listener.function.actor, definitionSite);
    }
    listener.function.url = definitionSite;
    listeners.push(listener);
  }
  fetchedDefinitions.clear();

  return listeners;
}

async function _getDefinitionSite(threadClient, func) {
  const grip = threadClient.pauseGrip(func);
  let response;

  try {
    response = await grip.getDefinitionSite();
  } catch (e) {
    // Don't make this error fatal, it would break the entire events pane.
    reportException("_getDefinitionSite", e);
    return null;
  }

  return response.source.url;
}

/**
 * @memberof actions/event-listeners
 * @static
 * @param {string} eventNames
 */
export function updateEventBreakpoints(eventNames) {
  return dispatch => {
    setNamedTimeout("event-breakpoints-update", 0, () => {
      gThreadClient.pauseOnDOMEvents(eventNames, function() {
        // Notify that event breakpoints were added/removed on the server.
        window.emit(EVENTS.EVENT_BREAKPOINTS_UPDATED);

        dispatch({
          type: constants.UPDATE_EVENT_BREAKPOINTS,
          eventNames: eventNames
        });
      });
    });
  };
}
