/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for breakpoints
 * @module actions/breakpoints
 */

import { isOriginalId } from "devtools-source-map";
import { PROMISE } from "../utils/middleware/promise";
import {
  getBreakpoint,
  getBreakpoints,
  getSelectedSource,
  getBreakpointAtLocation,
  getBreakpointsAtLine
} from "../../selectors";
import { assertBreakpoint } from "../../utils/breakpoint";
import {
  addBreakpoint,
  addHiddenBreakpoint,
  enableBreakpoint
} from "./addBreakpoint";
import remapLocations from "./remapLocations";
import { syncBreakpoint } from "./syncBreakpoint";
import { isEmptyLineInSource } from "../../reducers/ast";

// this will need to be changed so that addCLientBreakpoint is removed

import type { ThunkArgs, Action } from "../types";
import type { Breakpoint, Location } from "../../types";
import type { BreakpointsMap } from "../../reducers/types";

import { recordEvent } from "../../utils/telemetry";

type addBreakpointOptions = {
  condition?: string,
  hidden?: boolean
};

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

    recordEvent("remove_breakpoint");

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

    return dispatch({
      type: "REMOVE_BREAKPOINT",
      breakpoint: bp,
      disabled: false,
      [PROMISE]: client.removeBreakpoint(bp.generatedLocation)
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
    const promises = breakpoints
      .valueSeq()
      .toJS()
      .map(
        ([, breakpoint]) =>
          shouldDisableBreakpoints
            ? dispatch(disableBreakpoint(breakpoint.location))
            : dispatch(enableBreakpoint(breakpoint.location))
      );

    await Promise.all(promises);
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
    const breakpointList = getBreakpoints(getState())
      .valueSeq()
      .toJS();
    return Promise.all(
      breakpointList.map(bp => dispatch(removeBreakpoint(bp.location)))
    );
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
    const breakpointList = breakpoints.valueSeq().toJS();
    return Promise.all(
      breakpointList.map(bp => dispatch(removeBreakpoint(bp.location)))
    );
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
      isOriginalId(bp.location.sourceId)
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
    const state = getState();
    const selectedSource = getSelectedSource(state);

    if (!line || !selectedSource) {
      return;
    }

    const bp = getBreakpointAtLocation(state, { line, column });
    const isEmptyLine = isEmptyLineInSource(state, line, selectedSource.id);

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
        sourceId: selectedSource.id,
        sourceUrl: selectedSource.url,
        line: line,
        column: column
      })
    );
  };
}

export function toggleBreakpointsAtLine(line: number, column?: number) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const state = getState();
    const selectedSource = getSelectedSource(state);

    if (!line || !selectedSource) {
      return;
    }

    const bps = getBreakpointsAtLine(state, line);
    const isEmptyLine = isEmptyLineInSource(state, line, selectedSource.id);

    if (bps.size === 0 && !isEmptyLine) {
      return dispatch(
        addBreakpoint({
          sourceId: selectedSource.id,
          sourceUrl: selectedSource.url,
          line,
          column
        })
      );
    }

    return Promise.all(bps.map(bp => dispatch(removeBreakpoint(bp.location))));
  };
}

export function addOrToggleDisabledBreakpoint(line: ?number, column?: number) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const selectedSource = getSelectedSource(getState());

    if (!line || !selectedSource) {
      return;
    }

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
        sourceId: selectedSource.id,
        sourceUrl: selectedSource.url,
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

export { addBreakpoint, addHiddenBreakpoint, enableBreakpoint, syncBreakpoint };
