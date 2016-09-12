// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fromJS = require("../utils/fromJS");
const { updateObj } = require("../utils/utils");
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");
const setupReducer = require("../utils/redux/setupReducer");

import type {
  Action, Breakpoint, Location,
  AddBreakpoint, RemoveBreakpoint, SetBreakpointCondition
} from "../actions/types";
import type { Record } from "../utils/makeRecord";

/**
 * Redux reducer for the tabs state
 * @module reducers/breakpoints
 */

export type BreakpointsState = {
  breakpoints: I.Map<string, Breakpoint>,
  breakpointsDisabled: false
}

const State = makeRecord(({
  breakpoints: I.Map(),
  breakpointsDisabled: false
} : BreakpointsState));

/**
 * Handles adding and enabling breakpoints in the store.
 *
 * * **start** optimistically adds the breakpoint with the
 * *loading* field set to true.
 * * **done** sets the breakpoint with the *location* field set to false.
 * If the location changed, the initial breakpoint is deleted.
 * * **error** removes the breakpoint from the store.
 *
 * Called to enable a disabled breakpoint, which has been
 * removed on the server.
 *
 * @memberof reducers/breakpoints
 * @public
 */
function addBreakpoint(state, action: AddBreakpoint) {
  const id = makeLocationId(action.breakpoint.location);

  if (action.status === "start") {
    let bp = state.breakpoints.get(id) || action.breakpoint;

    return state.setIn(["breakpoints", id], updateObj(bp, {
      disabled: false,
      loading: true,
      // We want to do an OR here, but we can't because we need
      // empty strings to be truthy, i.e. an empty string is a valid
      // condition.
      condition: firstString(action.condition, bp.condition)
    }));
  } else if (action.status === "done") {
    const { id: breakpointId, text } = action.value;
    let location = action.breakpoint.location;
    let { actualLocation } = action.value;

    // If the breakpoint moved, update the map
    if (locationMoved(location, actualLocation)) {
      state = state.deleteIn(["breakpoints", id]);

      const movedId = makeLocationId(actualLocation);
      const currentBp = (state.breakpoints.get(movedId) ||
                         fromJS(action.breakpoint));
      const newBp = updateObj(currentBp, { location: actualLocation });
      state = state.setIn(["breakpoints", movedId], newBp);
      location = actualLocation;
    }

    const locationId = makeLocationId(location);
    const bp = state.breakpoints.get(locationId);
    return state.setIn(["breakpoints", locationId], updateObj(bp, {
      id: breakpointId,
      disabled: false,
      loading: false,
      text: text
    }));
  } else if (action.status === "error") {
    // Remove the optimistic update
    return state.deleteIn(["breakpoints", id]);
  }
}

/**
 * Handles removing and disabling breakpoints in the store.
 *
 * If the action's *disabled* field is true, the breakpoint is disabled.
 * Otherwise, the breakpoint is deleted from the store.
 *
 * @memberof reducers/breakpoints
 * @public
 */
function removeBreakpoint(state, action: RemoveBreakpoint) {
  if (action.status != "done") {
    return state;
  }

  const id = makeLocationId(action.breakpoint.location);

  if (action.disabled) {
    const bp = state.breakpoints.get(id);
    return state.setIn(["breakpoints", id], updateObj(bp, {
      loading: false, disabled: true
    }));
  }

  return state.deleteIn(["breakpoints", id]);
}

/**
 * Handles updating the *breakpointsDisabled* field.
 *
 * When breakpoints are toggled, each breakpoints is enabled or disabled
 * individually. All we need to do is maintain the toggle state.
 *
 * @memberof reducers/breakpoints
 * @public
 */
function toggleBreakpoints(state, action: SetBreakpointCondition) {
  if (action.status != "start") {
    return state;
  }

  return state.set(
    "breakpointsDisabled", action.shouldDisableBreakpoints);
}

/**
 *
 * @memberof reducers/breakpoints
 * @public
 */
function setBreakpointCondition(state, action: Action) {
  const id = makeLocationId(action.breakpoint.location);

  if (action.status === "start") {
    const bp = state.breakpoints.get(id);
    return state.setIn(["breakpoints", id], updateObj(bp, {
      loading: true,
      condition: action.condition
    }));
  } else if (action.status === "done") {
    const bp = state.breakpoints.get(id);
    return state.setIn(["breakpoints", id], updateObj(bp, {
      loading: false
    }));
  } else if (action.status === "error") {
    return state.deleteIn(["breakpoints", id]);
  }
}

// Return the first argument that is a string, or null if nothing is a
// string.
function firstString(...args) {
  for (let arg of args) {
    if (typeof arg === "string") {
      return arg;
    }
  }
  return null;
}

function locationMoved(location, newLocation) {
  return location.line !== newLocation.line ||
    (location.column != null &&
     location.column !== newLocation.column);
}

function makeLocationId(location: Location) {
  return location.sourceId + ":" + location.line.toString();
}

// Selectors

type OuterState = { breakpoints: Record<BreakpointsState> };

function getBreakpoint(state: OuterState, location: Location) {
  return state.breakpoints.breakpoints.get(makeLocationId(location));
}

function getBreakpoints(state: OuterState) {
  return state.breakpoints.breakpoints;
}

function getBreakpointsForSource(state: OuterState, sourceId: string) {
  return state.breakpoints.breakpoints.filter(bp => {
    return bp.location.sourceId === sourceId;
  });
}

function getBreakpointsDisabled(state: OuterState) {
  return state.breakpoints.get("breakpointsDisabled");
}

function getBreakpointsLoading(state: OuterState) {
  const breakpoints = getBreakpoints(state);
  const isLoading = !!breakpoints.valueSeq()
                    .filter(bp => bp.loading)
                    .first();

  return breakpoints.size > 0 && isLoading;
}

const update = setupReducer(State(), {
  addBreakpoint, removeBreakpoint, toggleBreakpoints, setBreakpointCondition
});

module.exports = {
  State,
  update,
  makeLocationId,
  getBreakpoint,
  getBreakpoints,
  getBreakpointsForSource,
  getBreakpointsDisabled,
  getBreakpointsLoading
};
