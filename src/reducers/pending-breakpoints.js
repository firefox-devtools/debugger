/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Pending breakpoints reducer
 * @module reducers/pending-breakpoints
 */

import * as I from "immutable";
import makeRecord from "../utils/makeRecord";

import {
  createPendingBreakpoint,
  makePendingLocationId
} from "../utils/breakpoint";

import { prefs } from "../utils/prefs";

import type { PendingBreakpoint } from "debugger-html";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type PendingBreakpointsMap = I.Map<string, PendingBreakpoint>;

export type PendingBreakpointsState = {
  pendingBreakpoints: PendingBreakpointsMap
};

export function initialState(): Record<PendingBreakpointsState> {
  return makeRecord(
    ({
      pendingBreakpoints: restorePendingBreakpoints()
    }: PendingBreakpointsState)
  )();
}

function update(
  state: Record<PendingBreakpointsState> = initialState(),
  action: Action
) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      if (action.breakpoint.hidden) {
        return state;
      }
      return addBreakpoint(state, action);
    }

    case "SYNC_BREAKPOINT": {
      return syncBreakpoint(state, action);
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
      if (action.breakpoint.hidden) {
        return state;
      }
      return removeBreakpoint(state, action);
    }
  }

  return state;
}

function addBreakpoint(state, action) {
  if (action.status !== "done") {
    return state;
  }
  // when the action completes, we can commit the breakpoint
  const { value: { breakpoint } } = action;
  const locationId = makePendingLocationId(breakpoint.location);
  const pendingBreakpoint = createPendingBreakpoint(breakpoint);

  return state.setIn(["pendingBreakpoints", locationId], pendingBreakpoint);
}

function syncBreakpoint(state, action) {
  const { breakpoint, previousLocation } = action;

  if (previousLocation) {
    state = state.deleteIn([
      "pendingBreakpoints",
      makePendingLocationId(previousLocation)
    ]);
  }

  if (!breakpoint) {
    return state;
  }

  const locationId = makePendingLocationId(breakpoint.location);
  const pendingBreakpoint = createPendingBreakpoint(breakpoint);

  return state.setIn(["pendingBreakpoints", locationId], pendingBreakpoint);
}

function updateBreakpoint(state, action) {
  const { breakpoint } = action;
  const locationId = makePendingLocationId(breakpoint.location);
  const pendingBreakpoint = createPendingBreakpoint(breakpoint);

  return state.setIn(["pendingBreakpoints", locationId], pendingBreakpoint);
}

function removeBreakpoint(state, action) {
  const { breakpoint } = action;

  const locationId = makePendingLocationId(breakpoint.location);
  const pendingBp = state.getIn(["pendingBreakpoints", locationId]);

  if (!pendingBp && action.status == "start") {
    return state.set("pendingBreakpoints", I.Map());
  }

  return state.deleteIn(["pendingBreakpoints", locationId]);
}

// Selectors
// TODO: these functions should be moved out of the reducer

type OuterState = { pendingBreakpoints: Record<PendingBreakpointsState> };

export function getPendingBreakpoints(state: OuterState) {
  return state.pendingBreakpoints.pendingBreakpoints;
}

export function getPendingBreakpointsForSource(
  state: OuterState,
  sourceUrl: String
) {
  const pendingBreakpoints = state.pendingBreakpoints.pendingBreakpoints || [];
  return pendingBreakpoints.filter(
    pendingBreakpoint => pendingBreakpoint.location.sourceUrl === sourceUrl
  );
}

function restorePendingBreakpoints() {
  return I.Map(prefs.pendingBreakpoints);
}

export default update;
