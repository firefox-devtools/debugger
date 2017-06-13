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
import { originalToGeneratedId } from "devtools-source-map";
import { equalizeLocationColumn } from "../utils/breakpoint";

import type { ThunkArgs } from "./types";
import type { PendingBreakpoint, Location } from "../types";

type addBreakpointOptions = {
  condition: string
};

function _breakpointExists(state, location: Location) {
  const currentBp = getBreakpoint(state, location);
  return currentBp && !currentBp.disabled;
}

function _createBreakpoint(location: Object, overrides: Object = {}) {
  const { condition, disabled, generatedLocation } = overrides;
  const properties = {
    condition: condition || null,
    disabled: disabled || false,
    generatedLocation,
    location
  };

  return properties;
}

async function _getGeneratedLocation(source, sourceMaps, location) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  return await sourceMaps.getGeneratedLocation(location, source.toJS());
}

async function _formatClientBreakpoint(clientBreakpoint, sourceMaps, location) {
  const clientOriginalLocation = await sourceMaps.getOriginalLocation(
    clientBreakpoint.actualLocation
  );

  // make sure that we are re-adding the same type of breakpoint. Column
  // or line
  const actualLocation = equalizeLocationColumn(
    clientOriginalLocation,
    location
  );

  // the generatedLocation might have slid, so now we can adjust it
  const generatedLocation = clientBreakpoint.actualLocation;

  const { id, hitCount } = clientBreakpoint;
  return { id, actualLocation, hitCount, generatedLocation };
}

// we have three forms of syncing: disabled syncing, existing server syncing
// and adding a new breakpoint
async function syncClientBreakpoint(
  sourceId: string,
  client,
  sourceMaps,
  pendingBreakpoint: PendingBreakpoint
) {
  const generatedSourceId = sourceMaps.isOriginalId(sourceId)
    ? originalToGeneratedId(sourceId)
    : sourceId;

  // this is the generatedLocation of the pending breakpoint, with
  // the source id updated to reflect the new connection
  const oldGeneratedLocation = {
    ...pendingBreakpoint.generatedLocation,
    sourceId: generatedSourceId
  };

  /** ******* CASE 1: Disabled ***********/
  // early return if breakpoint is disabled, send overrides to update
  // the id as expected
  if (pendingBreakpoint.disabled) {
    return {
      id: generatedSourceId,
      actualLocation: { ...pendingBreakpoint.location, id: sourceId },
      generatedLocation: oldGeneratedLocation
    };
  }

  /** ******* CASE 2: Merge Server Breakpoint ***********/
  // early return if breakpoint exists on the server, send overrides
  // to update the id as expected
  const existingClient = client.getBreakpointByLocation(oldGeneratedLocation);

  if (existingClient) {
    return _formatClientBreakpoint(
      existingClient,
      sourceMaps,
      pendingBreakpoint.location
    );
  }

  /** ******* CASE 3: Add New Breakpoint ***********/
  // If we are not disabled, set the breakpoint on the server and get
  // that info so we can set it on our breakpoints.
  const clientBreakpoint = await client.setBreakpoint(
    oldGeneratedLocation,
    pendingBreakpoint.condition,
    sourceMaps.isOriginalId(sourceId)
  );

  return _formatClientBreakpoint(
    clientBreakpoint,
    sourceMaps,
    pendingBreakpoint.location
  );
}

async function addClientBreakpoint(state, client, sourceMaps, breakpoint) {
  const location = breakpoint.location;
  const source = getSource(state, location.sourceId);
  const generatedLocation = await _getGeneratedLocation(
    source,
    sourceMaps,
    location
  );

  const clientBreakpoint = await client.setBreakpoint(
    generatedLocation,
    breakpoint.condition,
    sourceMaps.isOriginalId(breakpoint.location.sourceId)
  );

  const actualLocation = await sourceMaps.getOriginalLocation(
    clientBreakpoint.actualLocation
  );

  const { id, hitCount } = clientBreakpoint;
  return { id, actualLocation, hitCount, generatedLocation };
}

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
    const breakpoint = _createBreakpoint(location, pendingBreakpoint);

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
    if (_breakpointExists(getState(), location)) {
      return Promise.resolve();
    }

    const breakpoint = _createBreakpoint(location, { condition });
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
      [PROMISE]: client.removeBreakpoint(bp.id)
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
