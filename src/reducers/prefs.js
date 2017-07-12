// @flow

/**
 * Prefs reducer
 * @module reducers/prefs
 */

import { omit } from "lodash";

import { prefs } from "../utils/prefs";
import {
  makePendingLocationId,
  createPendingBreakpoint
} from "../utils/breakpoint";

import type { PendingBreakpoint } from "../types";
import type { Action } from "../actions/types";

export type PrefsState = {
  pendingBreakpoints: PendingBreakpoint
};

function update(state: PrefsState = prefs, action: Action) {
  switch (action.type) {
    case "ADD_BREAKPOINT": {
      const newState = addPendingBreakpoint(state, action);
      prefs.pendingBreakpoints = newState;
      return prefs;
    }
    default: {
      return prefs;
    }
  }
}

function addPendingBreakpoint(state, action) {
  if (action.status === "done") {
    const { value: { breakpoint, previousLocation } } = action;
    const pendingBreakpoints = prefs.pendingBreakpoints;

    const newPendingBreakpoint = createPendingBreakpoint(breakpoint);
    const id = newPendingBreakpoint.id;

    if (previousLocation) {
      const previousLocationId = makePendingLocationId(previousLocation);
      // option: we can use delete here instead; however it is modifying
      // prefs directly, so I preferend the functional approach. It is slower
      const newState = omit(pendingBreakpoints, [previousLocationId]);
      return { ...newState, [id]: newPendingBreakpoint };
    }

    return { ...pendingBreakpoints, [id]: newPendingBreakpoint };
  }
  return prefs.pendingBreakpoints;
}

export default update;
