/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const constants = require("../constants");
const fromJS = require("../util/fromJS");
const { makeLocationId } = require("../selectors");

const initialState = fromJS({
  breakpoints: {}
});

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

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_BREAKPOINT: {
      const id = makeLocationId(action.breakpoint.location);

      if (action.status === "start") {
        const existingBp = state.getIn(["breakpoints", id]);
        const bp = existingBp || fromJS(action.breakpoint);

        state = state.setIn(["breakpoints", id], bp.merge({
          disabled: false,
          loading: true,
          // We want to do an OR here, but we can't because we need
          // empty strings to be truthy, i.e. an empty string is a valid
          // condition.
          condition: firstString(action.condition, bp.condition)
        }));

        return state;
      } else if (action.status === "done") {
        const { id: breakpointId, text } = action.value;
        let location = action.breakpoint.location;
        let { actualLocation } = action.value;

        // If the breakpoint moved, update the map
        if (locationMoved(location, actualLocation)) {
          state = state.deleteIn(["breakpoints", id]);

          const movedId = makeLocationId(actualLocation);
          const currentBp = (state.getIn(["breakpoints", movedId]) ||
                             fromJS(action.breakpoint));
          const newBp = currentBp.merge({ location: fromJS(actualLocation) });
          state = state.setIn(["breakpoints", movedId], newBp);
          location = actualLocation;
        }

        const locationId = makeLocationId(location);
        return state.mergeIn(["breakpoints", locationId], {
          id: breakpointId,
          disabled: false,
          loading: false,
          text: text
        });
      } else if (action.status === "error") {
        // Remove the optimistic update
        return state.deleteIn(["breakpoints", id]);
      }
      break;
    }

    case constants.REMOVE_BREAKPOINT: {
      if (action.status === "done") {
        const id = makeLocationId(action.breakpoint.location);

        if (action.disabled) {
          return state.mergeIn(
            ["breakpoints", id],
            { loading: false, disabled: true }
          );
        }

        return state.deleteIn(["breakpoints", id]);
      }
      break;
    }

    case constants.SET_BREAKPOINT_CONDITION: {
      const id = makeLocationId(action.breakpoint.location);

      if (action.status === "start") {
        return state.mergeIn(["breakpoints", id], {
          loading: true,
          condition: action.condition
        });
      } else if (action.status === "done") {
        return state.mergeIn(["breakpoints", id], {
          loading: false
        });
      } else if (action.status === "error") {
        return state.deleteIn(["breakpoints", id]);
      }

      break;
    }}

  return state;
}

module.exports = update;
