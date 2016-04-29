/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const promise = require("ff-devtools-libs/sham/promise");
const constants = require("../constants");
const { PROMISE } = require("ff-devtools-libs/client/shared/redux/middleware/promise");
const {
  getSource, getBreakpoint, getBreakpoints
} = require("../selectors");
const { Task } = require("ff-devtools-libs/sham/task");
const { fromJS } = require("immutable");

// Because breakpoints are just simple data structures, we still need
// a way to lookup the actual client instance to talk to the server.
// We keep an internal database of clients based off of actor ID.
const BREAKPOINT_CLIENT_STORE = new Map();

function setBreakpointClient(actor, client) {
  BREAKPOINT_CLIENT_STORE.set(actor, client);
}

function getBreakpointClient(actor) {
  return BREAKPOINT_CLIENT_STORE.get(actor);
}

function enableBreakpoint(location) {
  // Enabling is exactly the same as adding. It will use the existing
  // breakpoint that still stored.
  return addBreakpoint(location);
}

function _breakpointExists(state, location) {
  const currentBp = getBreakpoint(state, location);
  return currentBp && !currentBp.get("disabled");
}

function _getOrCreateBreakpoint(state, location, condition) {
  return getBreakpoint(state, location) || fromJS({ location, condition });
}

function addBreakpoint(location, condition) {
  return ({ dispatch, getState, threadClient }) => {
    if (_breakpointExists(getState(), location)) {
      return promise.resolve();
    }

    const bp = _getOrCreateBreakpoint(getState(), location, condition);

    return dispatch({
      type: constants.ADD_BREAKPOINT,
      breakpoint: bp.toJS(),
      condition: condition,
      [PROMISE]: Task.spawn(function* () {
        const sourceClient = threadClient.source(
          getSource(getState(), bp.getIn(["location", "actor"])).toJS()
        );
        const [response, bpClient] = yield sourceClient.setBreakpoint({
          line: bp.getIn(["location", "line"]),
          column: bp.getIn(["location", "column"]),
          condition: bp.get("condition")
        });
        const { isPending, actualLocation } = response;

        // Save the client instance
        setBreakpointClient(bpClient.actor, bpClient);

        return {
          text: "<snippet>",

          // If the breakpoint response has an "actualLocation" attached, then
          // the original requested placement for the breakpoint wasn't
          // accepted.
          actualLocation: isPending ? null : actualLocation,
          actor: bpClient.actor
        };
      })
    });
  };
}

function disableBreakpoint(location) {
  return _removeOrDisableBreakpoint(location, true);
}

function removeBreakpoint(location) {
  return _removeOrDisableBreakpoint(location);
}

function _removeOrDisableBreakpoint(location, isDisabled) {
  return ({ dispatch, getState }) => {
    let bp = getBreakpoint(getState(), location);
    if (!bp) {
      throw new Error("attempt to remove breakpoint that does not exist");
    }
    if (bp.loading) {
      // TODO(jwl): make this wait until the breakpoint is saved if it
      // is still loading
      throw new Error("attempt to remove unsaved breakpoint");
    }

    const bpClient = getBreakpointClient(bp.get("actor"));
    const action = {
      type: constants.REMOVE_BREAKPOINT,
      breakpoint: bp.toJS(),
      disabled: isDisabled
    };

    // If the breakpoint is already disabled, we don't need to remove
    // it from the server. We just need to dispatch an action
    // simulating a successful server request to remove it, and it
    // will be removed completely from the state.
    if (!bp.disabled) {
      return dispatch(Object.assign({}, action, {
        [PROMISE]: bpClient.remove()
      }));
    }
    return dispatch(Object.assign({}, action, { status: "done" }));
  };
}

function removeAllBreakpoints() {
  return ({ dispatch, getState }) => {
    const breakpoints = getBreakpoints(getState());
    const activeBreakpoints = breakpoints.filter(bp => !bp.disabled);
    activeBreakpoints.forEach(bp => removeBreakpoint(bp.location));
  };
}

/**
 * Update the condition of a breakpoint.
 *
 * @param object aLocation
 *        @see DebuggerController.Breakpoints.addBreakpoint
 * @param string aClients
 *        The condition to set on the breakpoint
 * @return object
 *         A promise that will be resolved with the breakpoint client
 */
function setBreakpointCondition(location, condition) {
  return ({ dispatch, getState, threadClient }) => {
    const bp = getBreakpoint(getState(), location);
    if (!bp) {
      throw new Error("Breakpoint does not exist at the specified location");
    }
    if (bp.loading) {
      // TODO(jwl): when this function is called, make sure the action
      // creator waits for the breakpoint to exist
      throw new Error("breakpoint must be saved");
    }

    const bpClient = getBreakpointClient(bp.actor);

    return dispatch({
      type: constants.SET_BREAKPOINT_CONDITION,
      breakpoint: bp,
      condition: condition,
      [PROMISE]: Task.spawn(function* () {
        const newClient = yield bpClient.setCondition(threadClient, condition);

        // Remove the old instance and save the new one
        setBreakpointClient(bpClient.actor, null);
        setBreakpointClient(newClient.actor, newClient);

        return { actor: newClient.actor };
      })
    });
  };
}

module.exports = {
  enableBreakpoint,
  addBreakpoint,
  disableBreakpoint,
  removeBreakpoint,
  removeAllBreakpoints,
  setBreakpointCondition
};
