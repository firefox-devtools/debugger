// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Breakpoints reducer
 * @module reducers/breakpoints
 */

const fromJS = require("../utils/fromJS");
const { updateObj } = require("../utils/utils");
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");

import type { Breakpoint, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type BreakpointsState = {
  breakpoints: I.Map<string, Breakpoint>,
  breakpointsDisabled: false
}

const State = makeRecord(({
  breakpoints: I.Map(),
  breakpointsDisabled: false
} : BreakpointsState));

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
  return `${location.sourceId}:${location.line.toString()}`;
}

function update(state = State(), action: Action) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
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
      break;
    }

    case "REMOVE_BREAKPOINT": {
      if (action.status === "done") {
        const id = makeLocationId(action.breakpoint.location);

        if (action.disabled) {
          const bp = state.breakpoints.get(id);
          return state.setIn(["breakpoints", id], updateObj(bp, {
            loading: false, disabled: true
          }));
        }

        return state.deleteIn(["breakpoints", id]);
      }
      break;
    }

    case "TOGGLE_BREAKPOINTS": {
      if (action.status === "start") {
        return state.set(
          "breakpointsDisabled", action.shouldDisableBreakpoints);
      }
      break;
    }

    case "SET_BREAKPOINT_CONDITION": {
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
          id: action.value.id,
          loading: false
        }));
      } else if (action.status === "error") {
        return state.deleteIn(["breakpoints", id]);
      }

      break;
    }}

  return state;
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

function getBreakpointsDisabled(state: OuterState): boolean {
  return state.breakpoints.get("breakpointsDisabled");
}

function getBreakpointsLoading(state: OuterState) {
  const breakpoints = getBreakpoints(state);
  const isLoading = !!breakpoints.valueSeq()
                    .filter(bp => bp.loading)
                    .first();

  return breakpoints.size > 0 && isLoading;
}

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
