// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for breakpoints
 * @module actions/breakpoints
 */

import { PROMISE } from "../utils/redux/middleware/promise";
import { getBreakpoint, getBreakpoints, getSource } from "../selectors";

import type { ThunkArgs } from "./types";
import type { Location } from "../types";

type addBreakpointOptions = {
  condition: string,
  getTextForLine?: () => any
};

function _breakpointExists(state, location: Location) {
  const currentBp = getBreakpoint(state, location);
  return currentBp && !currentBp.disabled;
}

function _getOrCreateBreakpoint(state, location, condition) {
  return (
    getBreakpoint(state, location) || {
      location,
      condition,
      text: ""
    }
  );
}

/**
 * Enabling a breakpoint calls {@link addBreakpoint}
 * which will reuse the existing breakpoint information that is stored.
 *
 * @memberof actions/breakpoints
 * @static
 */
export function enableBreakpoint(location: Location) {
  return addBreakpoint(location);
}

/**
 * Add a new or enable an existing breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 * @param {String} $1.condition Conditional breakpoint condition value
 * @param {Function} $1.getTextForLine Get the text to represent the line
 */
export function addBreakpoint(
  location: Location,
  { condition, getTextForLine }: addBreakpointOptions = {}
) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    if (_breakpointExists(getState(), location)) {
      return Promise.resolve();
    }

    const bp = _getOrCreateBreakpoint(getState(), location, condition);

    return dispatch({
      type: "ADD_BREAKPOINT",
      breakpoint: bp,
      condition: condition,
      [PROMISE]: (async function() {
        if (sourceMaps.isOriginalId(bp.location.sourceId)) {
          const source = getSource(getState(), bp.location.sourceId);
          location = await sourceMaps.getGeneratedLocation(
            bp.location,
            source.toJS()
          );
        }

        let { id, actualLocation, hitCount } = await client.setBreakpoint(
          location,
          bp.condition,
          sourceMaps.isOriginalId(bp.location.sourceId)
        );

        actualLocation = await sourceMaps.getOriginalLocation(actualLocation);

        // If this breakpoint is being re-enabled, it already has a
        // text snippet.
        let text = bp.text;
        if (!text) {
          text = getTextForLine ? getTextForLine(actualLocation.line) : "";
        }
        return { id, actualLocation, text, hitCount };
      })()
    });
  };
}

/**
 * Disable a single breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 */
export function disableBreakpoint(location: Location) {
  return _removeOrDisableBreakpoint(location, true);
}

/**
 * Remove a single breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 */
export function removeBreakpoint(location: Location) {
  return _removeOrDisableBreakpoint(location);
}

function _removeOrDisableBreakpoint(location, isDisabled = false) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    let bp = getBreakpoint(getState(), location);
    if (!bp) {
      throw new Error("attempt to remove breakpoint that does not exist");
    }
    if (bp.loading) {
      // TODO(jwl): make this wait until the breakpoint is saved if it
      // is still loading
      throw new Error("attempt to remove unsaved breakpoint");
    }

    const action = {
      type: "REMOVE_BREAKPOINT",
      breakpoint: bp,
      disabled: isDisabled
    };

    // If the breakpoint is already disabled, we don't need to remove
    // it from the server. We just need to dispatch an action
    // simulating a successful server request to remove it, and it
    // will be removed completely from the state.
    if (!bp.disabled) {
      return dispatch(
        Object.assign({}, action, {
          [PROMISE]: client.removeBreakpoint(bp.id)
        })
      );
    }
    return dispatch(Object.assign({}, action, { status: "done" }));
  };
}

/**
 * Toggle All Breakpoints
 *
 * @memberof actions/breakpoints
 * @static
 */
export function toggleAllBreakpoints(shouldDisableBreakpoints: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const breakpoints = getBreakpoints(getState());
    return dispatch({
      type: "TOGGLE_BREAKPOINTS",
      shouldDisableBreakpoints,
      [PROMISE]: (async function() {
        for (let [, breakpoint] of breakpoints) {
          if (shouldDisableBreakpoints) {
            await dispatch(disableBreakpoint(breakpoint.location));
          } else {
            await dispatch(enableBreakpoint(breakpoint.location));
          }
        }
      })()
    });
  };
}

/**
 * Update the condition of a breakpoint.
 *
 * @throws {Error} "not implemented"
 * @memberof actions/breakpoints
 * @static
 * @param {Location} location
 *        @see DebuggerController.Breakpoints.addBreakpoint
 * @param {string} condition
 *        The condition to set on the breakpoint
 */
export function setBreakpointCondition(
  location: Location,
  { condition, getTextForLine }: addBreakpointOptions = {}
) {
  // location: Location, condition: string, { getTextForLine }) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const bp = getBreakpoint(getState(), location);
    if (!bp) {
      return dispatch(addBreakpoint(location, { condition, getTextForLine }));
    }

    if (bp.loading) {
      // TODO(jwl): when this function is called, make sure the action
      // creator waits for the breakpoint to exist
      throw new Error("breakpoint must be saved");
    }

    return dispatch({
      type: "SET_BREAKPOINT_CONDITION",
      breakpoint: bp,
      condition: condition,
      [PROMISE]: client.setBreakpointCondition(
        bp.id,
        location,
        condition,
        sourceMaps.isOriginalId(bp.location.sourceId)
      )
    });
  };
}
