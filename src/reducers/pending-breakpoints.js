// @flow

/**
 * Pending Breakpoints reducer
 * @module reducers/pending-breakpoints
 */
import * as I from "immutable";

import { prefs } from "../utils/prefs";
import {
  makePendingLocationId,
  createPendingBreakpoint
} from "../utils/breakpoint";
import makeRecord from "../utils/makeRecord";

export function initialState() {
  return makeRecord({ pendingBreakpoints: restorePendingBreakpoints() })();
}

function update(state = initialState(), action) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      const newState = addPendingBreakpoint(state, action);
      return newState;
    }
    default: {
      return state;
    }
  }
}

function addPendingBreakpoint(state, action) {
  if (action.status === "done") {
    const { value: { breakpoint, previousLocation } } = action;
    const pendingBreakpoint = createPendingBreakpoint(breakpoint);
    const id = pendingBreakpoint.id;

    console.log(state);
    if (previousLocation) {
      const previousLocationId = makePendingLocationId(previousLocation);
      return state
        .deleteIn(["pendingBreakpoints", previousLocationId])
        .setIn(["pendingBreakpoints", id], pendingBreakpoint);
    }

    return state.setIn(["pendingBreakpoints", id], pendingBreakpoint);
  }

  return state;
}

function restorePendingBreakpoints() {
  return I.Map(prefs.pendingBreakpoints);
}

export default update;
