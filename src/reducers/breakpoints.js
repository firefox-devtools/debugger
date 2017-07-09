// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import fromJS from "../utils/fromJS";
import * as I from "immutable";
import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";
import {
  firstString,
  locationMoved,
  makeLocationId,
  makePendingLocationId,
  allBreakpointsDisabled
} from "../utils/breakpoint";

import type { Breakpoint, PendingBreakpoint, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";
import { createSelector } from "reselect";

export type BreakpointsState = {
  breakpoints: I.Map<string, Breakpoint>,
  pendingBreakpoints: I.Map<string, PendingBreakpoint>,
  breakpointsDisabled: false
};

export function initialState(): Record<BreakpointsState> {
  return makeRecord(
    ({
      breakpoints: I.Map(),
      pendingBreakpoints: restorePendingBreakpoints(),
      breakpointsDisabled: false
    }: BreakpointsState)
  )();
}

function update(
  state: Record<BreakpointsState> = initialState(),
  action: Action
) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      const newState = addBreakpoint(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }

    case "SYNC_BREAKPOINT": {
      const newState = syncBreakpoint(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }

    case "ENABLE_BREAKPOINT": {
      const newState = enableBreakpoint(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }

    case "REMOVE_BREAKPOINT": {
      const newState = removeBreakpoint(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }

    case "DISABLE_BREAKPOINT": {
      const newState = disableBreakpoint(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }

    case "TOGGLE_BREAKPOINTS": {
      if (action.status === "start") {
        return state.set(
          "breakpointsDisabled",
          action.shouldDisableBreakpoints
        );
      }
      break;
    }

    case "SET_BREAKPOINT_CONDITION": {
      const newState = setCondition(state, action);
      setPendingBreakpoints(newState);
      return newState;
    }
  }

  return state;
}

function addBreakpoint(state, action) {
  const id = makeLocationId(action.breakpoint.location);
  if (action.status === "start") {
    const updatedState = state
      .setIn(["breakpoints", id], {
        ...action.breakpoint,
        loading: true,
        condition: firstString(action.condition, action.breakpoint.condition),
        hidden: action.hidden
      })
      .set("breakpointsDisabled", false);

    return updatedState;
  }

  if (action.status === "done") {
    const {
      id: breakpointId,
      actualLocation,
      generatedLocation
    } = action.value;
    let location = action.breakpoint.location;

    // If the breakpoint moved, update the map
    if (locationMoved(location, actualLocation)) {
      state = slideBreakpoint(state, action);
      location = actualLocation;
    }

    const locationId = makeLocationId(location);
    const bp = state.breakpoints.get(locationId) || action.breakpoint;
    const updatedBreakpoint = {
      ...bp,
      id: breakpointId,
      loading: false,
      generatedLocation,
      text: ""
    };
    const updatedState = state.setIn(
      ["breakpoints", locationId],
      updatedBreakpoint
    );

    return updatePendingBreakpoint(updatedState, updatedBreakpoint);
  }

  if (action.status === "error") {
    // Remove the optimistic update
    return state.deleteIn(["breakpoints", id]);
  }
}

function syncBreakpoint(state, action) {
  if (action.status === "start") {
    // add a breakpoint, so we always have something to work with
    return optimisticlyAddBreakpoint(state, action.breakpoint);
  }
  if (action.status === "done") {
    // when the action completes, we can commit the breakpoint
    const { breakpoint, value: { actualLocation, generatedLocation } } = action;
    const sameLocation = !locationMoved(breakpoint.location, actualLocation);

    // if the breakpoint is the same as the optimistic breakpoint, we can commit
    // to the optimistic value.
    if (sameLocation) {
      return commitBreakpoint(state, breakpoint, action.value);
    }

    // if the breakpoint is not the same, we will use the actual location sent
    // by the server, and correct the breakpoint with that new information.
    // Correcting a breakpoint deletes both the pending breakpoint and the
    // optimistic breakpoint. Correcting will commit the corrected value
    const overrides = { location: actualLocation, generatedLocation };
    const updatedState = correctBreakpoint(state, breakpoint, overrides);
    const id = makeLocationId(actualLocation);

    // once the corrected breakpoint is added and commited, we can update the
    // pending breakpoints with that information.
    const correctedBreakpoint = updatedState.breakpoints.get(id);
    return updatePendingBreakpoint(updatedState, correctedBreakpoint);
  }

  if (action.status === "error") {
    // Remove the optimistic update and pending breakpoint
    return deleteBreakpoint(state, action.breakpoint.location);
  }
}

function enableBreakpoint(state, action) {
  if (action.status != "done") {
    return state;
  }

  const id = makeLocationId(action.breakpoint.location);
  const bp = state.breakpoints.get(id);
  const updatedBreakpoint = {
    ...bp,
    id: action.value.id,
    loading: false,
    disabled: false
  };
  const updatedState = state.setIn(["breakpoints", id], updatedBreakpoint);
  return updatePendingBreakpoint(updatedState, updatedBreakpoint);
}

function disableBreakpoint(state, action) {
  if (action.status != "done") {
    return state;
  }
  const id = makeLocationId(action.breakpoint.location);
  const bp = state.breakpoints.get(id);
  const breakpoint = {
    ...bp,
    loading: false,
    disabled: true
  };
  const updatedState = state.setIn(["breakpoints", id], breakpoint);
  return updatePendingBreakpoint(updatedState, breakpoint);
}

function deleteBreakpoint(state, location) {
  const id = makeLocationId(location);
  const pendingId = makePendingLocationId(location);

  return state
    .deleteIn(["breakpoints", id])
    .deleteIn(["pendingBreakpoints", pendingId]);
}

function removeBreakpoint(state, action) {
  if (action.status != "done") {
    return state;
  }

  const updatedState = deleteBreakpoint(state, action.breakpoint.location);

  return updatedState.set(
    "breakpointsDisabled",
    allBreakpointsDisabled(updatedState)
  );
}

function setCondition(state, action) {
  const id = makeLocationId(action.breakpoint.location);

  if (action.status === "start") {
    const bp = state.breakpoints.get(id);
    return state.setIn(["breakpoints", id], {
      ...bp,
      loading: true,
      condition: action.condition
    });
  }

  if (action.status === "done") {
    const bp = state.breakpoints.get(id);
    const updatedBreakpoint = { ...bp, loading: false };
    const updatedState = state.setIn(["breakpoints", id], updatedBreakpoint);

    return updatePendingBreakpoint(updatedState, updatedBreakpoint);
  }

  if (action.status === "error") {
    return state.deleteIn(["breakpoints", id]);
  }
}

// Syncing Methods
function optimisticlyAddBreakpoint(state, breakpoint) {
  const id = makeLocationId(breakpoint.location);
  const updateOpts = {
    loading: true
  };

  return state.setIn(["breakpoints", id], { ...breakpoint, ...updateOpts });
}

function commitBreakpoint(state, breakpoint, overrides = {}) {
  // A commited breakpoint is no longer loading, and acts like a normal
  // breakpoint
  const location = overrides.location || breakpoint.location;
  const id = makeLocationId(location);
  const updatedOpts = { ...overrides, loading: false };
  const updatedBreakpoint = { ...breakpoint, ...updatedOpts };

  return state.setIn(["breakpoints", id], updatedBreakpoint);
}

function correctBreakpoint(state, breakpoint, overrides) {
  const intermState = deleteBreakpoint(state, breakpoint.location);
  const newLocationId = makeLocationId(overrides.location);
  const newProperties = { id: newLocationId, ...overrides };

  return commitBreakpoint(intermState, breakpoint, newProperties);
}

// TODO: remove this in favor of the correct/commit breakpoint pattern
function slideBreakpoint(state, action) {
  const { actualLocation, id } = action.value;
  const { breakpoint } = action;
  const currentBp = state.breakpoints.get(id) || fromJS(breakpoint);

  const locationId = makeLocationId(breakpoint.location);
  const movedLocationId = makeLocationId(actualLocation);
  const updatedState = state.deleteIn(["breakpoints", locationId]);

  return updatedState.setIn(["breakpoints", movedLocationId], {
    ...currentBp,
    location: actualLocation
  });
}

export function makePendingBreakpoint(bp: any) {
  const {
    location: { sourceUrl, line, column },
    condition,
    disabled,
    generatedLocation
  } = bp;

  const location = { sourceUrl, line, column };
  return { condition, disabled, generatedLocation, location };
}

function setPendingBreakpoints(state: any) {
  prefs.pendingBreakpoints = state.pendingBreakpoints;
}

function updatePendingBreakpoint(state, breakpoint) {
  const id = makePendingLocationId(breakpoint.location);
  return state.setIn(
    ["pendingBreakpoints", id],
    makePendingBreakpoint(breakpoint)
  );
}

function restorePendingBreakpoints() {
  return I.Map(prefs.pendingBreakpoints);
}

// Selectors

type OuterState = { breakpoints: Record<BreakpointsState> };

export function getBreakpoint(state: OuterState, location: Location) {
  return state.breakpoints.breakpoints.get(makeLocationId(location));
}

export function getBreakpoints(state: OuterState): I.Map<string, Breakpoint> {
  return state.breakpoints.breakpoints;
}

export function getBreakpointsForSource(state: OuterState, sourceId: string) {
  return state.breakpoints.breakpoints.filter(bp => {
    return bp.location.sourceId === sourceId;
  });
}

export function getBreakpointsDisabled(state: OuterState): boolean {
  return state.breakpoints.get("breakpointsDisabled");
}

export function getBreakpointsLoading(state: OuterState) {
  const breakpoints = getBreakpoints(state);
  const isLoading = !!breakpoints.valueSeq().filter(bp => bp.loading).first();

  return breakpoints.size > 0 && isLoading;
}

export function getPendingBreakpoints(state: OuterState) {
  return state.breakpoints.pendingBreakpoints;
}

export const getHiddenBreakpoints = createSelector(getBreakpoints, function(
  breakpoints
) {
  return breakpoints
    .valueSeq()
    .filter(breakpoint => breakpoint.has("hidden"))
    .map(hiddenBreakpoint => hiddenBreakpoint.get("location"));
});

export const getHiddenBreakpoint = createSelector(
  getHiddenBreakpoints,
  hiddenBreakpoints => {
    if (hiddenBreakpoints.length) {
      return hiddenBreakpoints[0];
    }
    return null;
  }
);

export default update;
