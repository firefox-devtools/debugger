/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const defer = require("devtools/shared/defer");
const constants = require("../constants");
const { PROMISE } = require("devtools-sham/client/shared/redux/middleware/promise");
const {
  getBreakpoint, getBreakpoints
} = require("../selectors");
const { Task } = require("devtools-sham/sham/task");
const fromJS = require("../util/fromJS");

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

function addBreakpoint(location, { condition, getTextForLine } = {}) {
  return ({ dispatch, getState, client }) => {
    if (_breakpointExists(getState(), location)) {
      return Promise.resolve();
    }

    const bp = _getOrCreateBreakpoint(getState(), location, condition);

    return dispatch({
      type: constants.ADD_BREAKPOINT,
      breakpoint: bp.toJS(),
      condition: condition,
      [PROMISE]: Task.spawn(function* () {
        const { id, actualLocation } = yield client.setBreakpoint(
          bp.get("location").toJS(),
          bp.get("condition")
        );

        // If this breakpoint is being re-enabled, it already has a
        // text snippet.
        let text = bp.get("text");
        if (!text) {
          text = getTextForLine ? getTextForLine(actualLocation.line) : "";
        }

        return { id, actualLocation, text };
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
  return ({ dispatch, getState, client }) => {
    let bp = getBreakpoint(getState(), location);
    if (!bp) {
      throw new Error("attempt to remove breakpoint that does not exist");
    }
    if (bp.get("loading")) {
      // TODO(jwl): make this wait until the breakpoint is saved if it
      // is still loading
      throw new Error("attempt to remove unsaved breakpoint");
    }

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
        [PROMISE]: client.removeBreakpoint(bp.get("id"))
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
  throw new Error("not implemented");

  // return ({ dispatch, getState, client }) => {
  //   const bp = getBreakpoint(getState(), location);
  //   if (!bp) {
  //     throw new Error("Breakpoint does not exist at the specified location");
  //   }
  //   if (bp.get("loading")) {
  //     // TODO(jwl): when this function is called, make sure the action
  //     // creator waits for the breakpoint to exist
  //     throw new Error("breakpoint must be saved");
  //   }

  //   return dispatch({
  //     type: constants.SET_BREAKPOINT_CONDITION,
  //     breakpoint: bp,
  //     condition: condition,
  //     [PROMISE]: Task.spawn(function* () {
  //       yield client.setBreakpointCondition(bp.get("id"), condition);
  //     })
  //   });
  // };
}

module.exports = {
  enableBreakpoint,
  addBreakpoint,
  disableBreakpoint,
  removeBreakpoint,
  removeAllBreakpoints,
  setBreakpointCondition
};
