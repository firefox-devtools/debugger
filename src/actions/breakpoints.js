/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for breakpoints
 * @module actions/breakpoints
 */

import { PROMISE } from "./utils/middleware/promise";
import {
  getBreakpoint,
  getBreakpoints,
  getSelectedSource,
  getBreakpointAtLocation
} from "../selectors";
import { createBreakpoint, assertBreakpoint } from "../utils/breakpoint";
import addBreakpointPromise from "./breakpoints/addBreakpoint";
import remapLocations from "./breakpoints/remapLocations";
import { isEmptyLineInSource } from "../reducers/ast";

// this will need to be changed so that addCLientBreakpoint is removed
import { syncClientBreakpoint } from "./breakpoints/syncBreakpoint";

import type { ThunkArgs, Action } from "./types";
import type {
  Breakpoint,
  SourceId,
  PendingBreakpoint,
  Location
} from "../types";
import type { BreakpointsMap } from "../reducers/types";

type addBreakpointOptions = {
  condition?: string,
  hidden?: boolean
};

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
  sourceId: SourceId,
  pendingBreakpoint: PendingBreakpoint
) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { breakpoint, previousLocation } = await syncClientBreakpoint(
      getState,
      client,
      sourceMaps,
      sourceId,
      pendingBreakpoint
    );

    return dispatch(
      ({
        type: "SYNC_BREAKPOINT",
        breakpoint,
        previousLocation
      }: Action)
    );
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
  { condition, hidden }: addBreakpointOptions = {}
) {
  const breakpoint = createBreakpoint(location, { condition, hidden });
  return ({ dispatch, getState, sourceMaps, client }: ThunkArgs) => {
    return dispatch(
      ({
        type: "ADD_BREAKPOINT",
        breakpoint,
        [PROMISE]: addBreakpointPromise(
          getState,
          client,
          sourceMaps,
          breakpoint
        )
      }: Action)
    );
  };
}

/**
 * Add a new hidden breakpoint
 *
 * @memberOf actions/breakpoints
 * @param location
 * @return {function(ThunkArgs)}
 */
export function addHiddenBreakpoint(location: Location) {
  return ({ dispatch }: ThunkArgs) => {
    return dispatch(addBreakpoint(location, { hidden: true }));
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
    const bp = getBreakpoint(getState(), location);
    if (!bp || bp.loading) {
      return;
    }

    // If the breakpoint is already disabled, we don't need to communicate
    // with the server. We just need to dispatch an action
    // simulating a successful server request
    if (bp.disabled) {
      return dispatch(
        ({
          type: "REMOVE_BREAKPOINT",
          breakpoint: bp,
          status: "done"
        }: Action)
      );
    }

    return dispatch(
      ({
        type: "REMOVE_BREAKPOINT",
        breakpoint: bp,
        disabled: false,
        [PROMISE]: client.removeBreakpoint(bp.generatedLocation)
      }: Action)
    );
  };
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
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const breakpoint = getBreakpoint(getState(), location);
    if (!breakpoint || breakpoint.loading) {
      return;
    }

    return dispatch(
      ({
        type: "ENABLE_BREAKPOINT",
        breakpoint,
        [PROMISE]: addBreakpointPromise(
          getState,
          client,
          sourceMaps,
          breakpoint
        )
      }: Action)
    );
  };
}

/**
 * Disable a single breakpoint
 *
 * @memberof actions/breakpoints
 * @static
 */
export function disableBreakpoint(location: Location) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const bp = getBreakpoint(getState(), location);

    if (!bp || bp.loading) {
      return;
    }

    await client.removeBreakpoint(bp.generatedLocation);
    const newBreakpoint: Breakpoint = { ...bp, disabled: true };

    return dispatch(
      ({
        type: "DISABLE_BREAKPOINT",
        breakpoint: newBreakpoint
      }: Action)
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
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const breakpoints = getBreakpoints(getState());

    const modifiedBreakpoints = [];

    for (const [, breakpoint] of breakpoints) {
      if (shouldDisableBreakpoints) {
        await client.removeBreakpoint(breakpoint.generatedLocation);
        const newBreakpoint: Breakpoint = { ...breakpoint, disabled: true };
        modifiedBreakpoints.push(newBreakpoint);
      } else {
        const newBreakpoint: Breakpoint = { ...breakpoint, disabled: false };
        modifiedBreakpoints.push(newBreakpoint);
      }
    }

    if (shouldDisableBreakpoints) {
      return dispatch(
        ({
          type: "DISABLE_ALL_BREAKPOINTS",
          breakpoints: modifiedBreakpoints
        }: Action)
      );
    }

    return dispatch(
      ({
        type: "ENABLE_ALL_BREAKPOINTS",
        breakpoints: modifiedBreakpoints
      }: Action)
    );
  };
}

/**
 * Toggle Breakpoints
 *
 * @memberof actions/breakpoints
 * @static
 */
export function toggleBreakpoints(
  shouldDisableBreakpoints: boolean,
  breakpoints: BreakpointsMap
) {
  return async ({ dispatch }: ThunkArgs) => {
    for (const [, breakpoint] of breakpoints) {
      if (shouldDisableBreakpoints) {
        await dispatch(disableBreakpoint(breakpoint.location));
      } else {
        await dispatch(enableBreakpoint(breakpoint.location));
      }
    }
  };
}

/**
 * Removes all breakpoints
 *
 * @memberof actions/breakpoints
 * @static
 */
export function removeAllBreakpoints() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const breakpoints = getBreakpoints(getState());
    for (const [, breakpoint] of breakpoints) {
      await dispatch(removeBreakpoint(breakpoint.location));
    }
  };
}

/**
 * Removes breakpoints
 *
 * @memberof actions/breakpoints
 * @static
 */
export function removeBreakpoints(breakpoints: BreakpointsMap) {
  return async ({ dispatch }: ThunkArgs) => {
    for (const [, breakpoint] of breakpoints) {
      await dispatch(removeBreakpoint(breakpoint.location));
    }
  };
}

export function remapBreakpoints(sourceId: string) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    const breakpoints = getBreakpoints(getState());
    const newBreakpoints = await remapLocations(
      breakpoints,
      sourceId,
      sourceMaps
    );

    return dispatch(
      ({
        type: "REMAP_BREAKPOINTS",
        breakpoints: newBreakpoints
      }: Action)
    );
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
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const bp = getBreakpoint(getState(), location);
    if (!bp) {
      return dispatch(addBreakpoint(location, { condition }));
    }

    if (bp.loading) {
      return;
    }

    if (bp.disabled) {
      await dispatch(enableBreakpoint(location));
      bp.disabled = !bp.disabled;
    }

    await client.setBreakpointCondition(
      bp.id,
      location,
      condition,
      sourceMaps.isOriginalId(bp.location.sourceId)
    );

    const newBreakpoint = { ...bp, condition };

    assertBreakpoint(newBreakpoint);

    return dispatch(
      ({
        type: "SET_BREAKPOINT_CONDITION",
        breakpoint: newBreakpoint
      }: Action)
    );
  };
}

export function toggleBreakpoint(line: ?number, column?: number) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    if (!line) {
      return;
    }

    const state = getState();
    const selectedSource = getSelectedSource(state);
    const bp = getBreakpointAtLocation(state, { line, column });
    const isEmptyLine = isEmptyLineInSource(state, line, selectedSource);

    if ((!bp && isEmptyLine) || (bp && bp.loading)) {
      return;
    }

    if (bp) {
      // NOTE: it's possible the breakpoint has slid to a column
      return dispatch(
        removeBreakpoint({
          sourceId: bp.location.sourceId,
          sourceUrl: bp.location.sourceUrl,
          line: bp.location.line,
          column: column || bp.location.column
        })
      );
    }
    return dispatch(
      addBreakpoint({
        sourceId: selectedSource.get("id"),
        sourceUrl: selectedSource.get("url"),
        line: line,
        column: column
      })
    );
  };
}

export function addOrToggleDisabledBreakpoint(line: ?number, column?: number) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    if (!line) {
      return;
    }

    const selectedSource = getSelectedSource(getState());
    const bp = getBreakpointAtLocation(getState(), { line, column });

    if (bp && bp.loading) {
      return;
    }

    if (bp) {
      // NOTE: it's possible the breakpoint has slid to a column
      return dispatch(
        toggleDisabledBreakpoint(line, column || bp.location.column)
      );
    }

    return dispatch(
      addBreakpoint({
        sourceId: selectedSource.get("id"),
        sourceUrl: selectedSource.get("url"),
        line: line,
        column: column
      })
    );
  };
}

export function toggleDisabledBreakpoint(line: number, column?: number) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const bp = getBreakpointAtLocation(getState(), { line, column });
    if (!bp || bp.loading) {
      return;
    }

    if (!bp.disabled) {
      return dispatch(disableBreakpoint(bp.location));
    }
    return dispatch(enableBreakpoint(bp.location));
  };
}
