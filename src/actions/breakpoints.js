// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for breakpoints
 * @module actions/breakpoints
 */

import { PROMISE } from "../utils/redux/middleware/promise";
import { getBreakpoint, getBreakpoints } from "../selectors";
import { breakpointExists, createBreakpoint } from "./utils/breakpoints";

import {
  addClientBreakpoint,
  syncClientBreakpoint
} from "./thunks/breakpoints";

import type { ThunkArgs } from "./types";
import type { PendingBreakpoint, Location } from "../types";

type addBreakpointOptions = {
  condition: string
};
/**
 * Enabling a breakpoint
 * will reuse the existing breakpoint information that is stored.
 *
 * @memberof actions/breakpoints
 * @static
 * @param {Location} $1.location Location  value
 */
export function enableBreakpoint(location: Location) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const breakpoint = getBreakpoint(getState(), location);
    if (!breakpoint) {
      throw new Error("attempted to enable a breakpoint that does not exist");
    }

    return dispatch({
      type: "ENABLE_BREAKPOINT",
      breakpoint,
      [PROMISE]: addClientBreakpoint(getState(), client, sourceMaps, breakpoint)
    });
  };
}

/**
 * Syncing a breakpoint add breakpoint information that is stored, and
 * contact the server for more data.
 *
 * @memberof actions/breakpoints
 * @static
 * @param {String} $1.sourceId String  value
 * @param {PendingBreakpoint} $1.location PendingBreakpoint  value
 */
export function syncBreakpoint(
  sourceId: string,
  pendingBreakpoint: PendingBreakpoint
) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { line, sourceUrl, column } = pendingBreakpoint.location;
    const location = { sourceId, sourceUrl, line, column };
    const breakpoint = createBreakpoint(location, pendingBreakpoint);

    const syncPromise = syncClientBreakpoint(
      sourceId,
      client,
      sourceMaps,
      pendingBreakpoint
    );

    return dispatch({
      type: "SYNC_BREAKPOINT",
      breakpoint,
      [PROMISE]: syncPromise
    });
  };
}

/**
 * Add a new breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 * @param {String} $1.condition Conditional breakpoint condition value
 * @param {Boolean} $1.disabled Disable value for breakpoint value
 */
export function addBreakpoint(
  location: Location,
  { condition }: addBreakpointOptions = {}
) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    if (breakpointExists(getState(), location)) {
      return Promise.resolve();
    }

    const breakpoint = createBreakpoint(location, { condition });
    return dispatch({
      type: "ADD_BREAKPOINT",
      breakpoint,
      condition: condition,
      [PROMISE]: addClientBreakpoint(getState(), client, sourceMaps, breakpoint)
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
  return ({ dispatch, getState, client }: ThunkArgs) => {
    let bp = getBreakpoint(getState(), location);
    if (!bp) {
      throw new Error("attempt to disable a breakpoint that does not exist");
    }
    if (bp.loading) {
      // TODO(jwl): make this wait until the breakpoint is saved if it
      // is still loading
      throw new Error("attempt to disable unsaved breakpoint");
    }

    const action = {
      type: "DISABLE_BREAKPOINT",
      breakpoint: bp,
      disabled: true,
      [PROMISE]: client.removeBreakpoint(bp)
    };

    return dispatch(action);
  };
}

/**
 * Remove a single breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 */
export function removeBreakpoint(location: Location) {
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
      breakpoint: bp
    };

    // If the breakpoint is already disabled, we don't need to communicate
    // with the server. We just need to dispatch an action
    // simulating a successful server request
    if (bp.disabled) {
      return dispatch(Object.assign({}, action, { status: "done" }));
    }

    return dispatch(
      Object.assign({}, action, {
        [PROMISE]: client.removeBreakpoint(bp)
      })
    );
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
 * @param {Boolean} $1.disabled Disable value for breakpoint value
 */
export function setBreakpointCondition(
  location: Location,
  { condition }: addBreakpointOptions = {}
) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const bp = getBreakpoint(getState(), location);
    if (!bp) {
      return dispatch(addBreakpoint(location, { condition }));
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
