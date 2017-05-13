// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

import fromJS from "../utils/fromJS";
import { updateObj } from "../utils/utils";
import * as I from "immutable";
import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { Breakpoint, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type BreakpointsState = {
  breakpoints: I.Map<string, Breakpoint>,
  pendingBreakpoints: ?I.Map<string, any>,
  breakpointsDisabled: false
};

export const State = makeRecord(
  ({
    breakpoints: I.Map(),
    pendingBreakpoints: restorePendingBreakpoints(),
    breakpointsDisabled: false
  }: BreakpointsState)
);

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
  return (
    location.line !== newLocation.line ||
    (location.column != null && location.column !== newLocation.column)
  );
}

export function makeLocationId(location: Location) {
  let { sourceId, line, column } = location;
  column = column || "";
  return `${sourceId}:${line}:${column}`;
}

function allBreakpointsDisabled(state) {
  return state.breakpoints.every(x => x.disabled);
}

function update(state: Record<BreakpointsState> = State(), action: Action) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      const newState = addBreakpoint(state, action);
      if (newState) {
        setPendingBreakpoints(newState);
      }
      return newState;
    }

    case "REMOVE_BREAKPOINT": {
      const newState = removeBreakpoint(state, action);
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
      const id = makeLocationId(action.breakpoint.location);

      if (action.status === "start") {
        const bp = state.breakpoints.get(id);
        return state.setIn(
          ["breakpoints", id],
          updateObj(bp, {
            loading: true,
            condition: action.condition
          })
        );
      } else if (action.status === "done") {
        const bp = state.breakpoints.get(id);
        return state.setIn(
          ["breakpoints", id],
          updateObj(bp, {
            id: action.value.id,
            loading: false
          })
        );
      } else if (action.status === "error") {
        return state.deleteIn(["breakpoints", id]);
      }

      break;
    }
  }

  return state;
}

function addBreakpoint(state, action) {
  const id = makeLocationId(action.breakpoint.location);

  if (action.status === "start") {
    let bp = state.breakpoints.get(id) || action.breakpoint;

    return state
      .setIn(
        ["breakpoints", id],
        updateObj(bp, {
          disabled: false,
          loading: true,
          // We want to do an OR here, but we can't because we need
          // empty strings to be truthy, i.e. an empty string is a valid
          // condition.
          condition: firstString(action.condition, bp.condition)
        })
      )
      .set("breakpointsDisabled", false);
  }

  if (action.status === "done") {
    const { id: breakpointId, text } = action.value;
    let location = action.breakpoint.location;
    let { actualLocation } = action.value;

    // If the breakpoint moved, update the map
    if (locationMoved(location, actualLocation)) {
      state = state.deleteIn(["breakpoints", id]);

      const movedId = makeLocationId(actualLocation);
      const currentBp =
        state.breakpoints.get(movedId) || fromJS(action.breakpoint);
      const newBp = updateObj(currentBp, { location: actualLocation });
      state = state.setIn(["breakpoints", movedId], newBp);
      location = actualLocation;
    }

    const locationId = makeLocationId(location);
    const bp = state.breakpoints.get(locationId);
    return state.setIn(
      ["breakpoints", locationId],
      updateObj(bp, {
        id: breakpointId,
        disabled: false,
        loading: false,
        text: text
      })
    );
  }

  if (action.status === "error") {
    // Remove the optimistic update
    return state.deleteIn(["breakpoints", id]);
  }
}

function removeBreakpoint(state, action) {
  if (action.status === "done") {
    const id = makeLocationId(action.breakpoint.location);

    if (action.disabled) {
      const bp = state.breakpoints.get(id);
      const updatedState = state.setIn(
        ["breakpoints", id],
        updateObj(bp, {
          loading: false,
          disabled: true
        })
      );

      return updatedState.set(
        "breakpointsDisabled",
        allBreakpointsDisabled(updatedState)
      );
    }

    const updatedState = state.deleteIn(["breakpoints", id]);

    return updatedState.set(
      "breakpointsDisabled",
      allBreakpointsDisabled(updatedState)
    );
  }

  return state;
}

function makePendingBreakpoint(bp: any) {
  const { location: { sourceUrl, line, column }, condition, disabled } = bp;

  const location = { sourceUrl, line, column };
  return { condition, disabled, location };
}

function filterByNotLoading(bp: any): boolean {
  return !bp.loading;
}

function setPendingBreakpoints(state) {
  prefs.pendingBreakpoints = Object.values(state.get("breakpoints").toJS())
    .filter(filterByNotLoading)
    .map(makePendingBreakpoint);
}

function restorePendingBreakpoints() {
  return prefs.pendingBreakpoints;
}

// Selectors

type OuterState = { breakpoints: Record<BreakpointsState> };

export function getBreakpoint(state: OuterState, location: Location) {
  return state.breakpoints.breakpoints.get(makeLocationId(location));
}

export function getBreakpoints(state: OuterState) {
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

export default update;
