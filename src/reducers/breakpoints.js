// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import * as I from "immutable";
import makeRecord from "../utils/makeRecord";

import { isGeneratedId } from "devtools-source-map";
import { makeLocationId } from "../utils/breakpoint";

import type { Breakpoint, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";
import { createSelector } from "reselect";

export type BreakpointsMap = I.Map<string, Breakpoint>;

export type BreakpointsState = {
  breakpoints: BreakpointsMap
};

export function initialState(): Record<BreakpointsState> {
  return makeRecord(
    ({
      breakpoints: I.Map(),
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
      return addBreakpoint(state, action);
    }

    case "SYNC_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "ENABLE_BREAKPOINT": {
      return addBreakpoint(state, action);
    }

    case "DISABLE_BREAKPOINT": {
      return updateBreakpoint(state, action);
    }

    case "SET_BREAKPOINT_CONDITION": {
      return updateBreakpoint(state, action);
    }

    case "REMOVE_BREAKPOINT": {
      return removeBreakpoint(state, action);
    }

    case "REMAP_BREAKPOINTS": {
      return remapBreakpoints(state, action);
    }
  }

  return state;
}

function addBreakpoint(state, action) {
  if (action.status === "start" && action.breakpoint) {
    const { breakpoint } = action;
    const locationId = makeLocationId(breakpoint.location);
    return state.setIn(["breakpoints", locationId], breakpoint);
  }

  // when the action completes, we can commit the breakpoint
  if (action.status === "done") {
    const { value: { breakpoint, previousLocation } } = action;
    const locationId = makeLocationId(breakpoint.location);

    if (previousLocation) {
      return state
        .deleteIn(["breakpoints", makeLocationId(previousLocation)])
        .setIn(["breakpoints", locationId], breakpoint);
    }

    return state.setIn(["breakpoints", locationId], breakpoint);
  }

  // Remove the optimistic update
  if (action.status === "error" && action.breakpoint) {
    const locationId = makeLocationId(action.breakpoint.location);
    return state.deleteIn(["breakpoints", locationId]);
  }

  return state;
}

function updateBreakpoint(state, action) {
  const { breakpoint } = action;
  const locationId = makeLocationId(breakpoint.location);
  return state.setIn(["breakpoints", locationId], breakpoint);
}

function remapBreakpoints(state, action) {
  const breakpoints = action.breakpoints.reduce(
    (updatedBreakpoints, breakpoint) => {
      const locationId = makeLocationId(breakpoint.location);
      return { ...updatedBreakpoints, [locationId]: breakpoint };
    },
    {}
  );

  return state.set("breakpoints", I.Map(breakpoints));
}

function removeBreakpoint(state, action) {
  const { breakpoint } = action;
  const id = makeLocationId(breakpoint.location);
  return state.deleteIn(["breakpoints", id]);
}

// Selectors
// TODO: these functions should be moved out of the reducer

type OuterState = { breakpoints: Record<BreakpointsState> };

export function getBreakpoints(state: OuterState) {
  return state.breakpoints.breakpoints;
}

export function getBreakpoint(state: OuterState, location: Location) {
  const breakpoints = getBreakpoints(state);
  return breakpoints.get(makeLocationId(location));
}

export function getBreakpointsDisabled(state: OuterState): boolean {
  return state.breakpoints.breakpoints.every(x => x.disabled);
}

export function getBreakpointsLoading(state: OuterState) {
  const breakpoints = getBreakpoints(state);
  const isLoading = !!breakpoints.valueSeq().filter(bp => bp.loading).first();

  return breakpoints.size > 0 && isLoading;
}

export function getBreakpointsForSource(state: OuterState, sourceId: string) {
  if (!sourceId) {
    return I.Map();
  }

  const isGeneratedSource = isGeneratedId(sourceId);
  const breakpoints = getBreakpoints(state);

  return breakpoints.filter(bp => {
    const location = isGeneratedSource
      ? bp.generatedLocation || bp.location
      : bp.location;
    return location.sourceId === sourceId;
  });
}

export const getHiddenBreakpoint = createSelector(getBreakpoints, function(
  breakpoints
) {
  const hiddenBreakpoints = breakpoints
    .valueSeq()
    .filter(breakpoint => breakpoint.hidden)
    .first();
  return hiddenBreakpoints;
});

export const getHiddenBreakpointLocation = createSelector(
  getHiddenBreakpoint,
  function(hiddenBreakpoint) {
    if (!hiddenBreakpoint) {
      return null;
    }
    return hiddenBreakpoint.location;
  }
);

export default update;
