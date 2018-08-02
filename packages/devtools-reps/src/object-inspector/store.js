/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
const { applyMiddleware, createStore, compose } = require("redux");
const { thunk } = require("../shared/redux/middleware/thunk");
const {
  waitUntilService
} = require("../shared/redux/middleware/waitUntilService");
const reducer = require("./reducer");

import type { Props, State } from "./types";

function createInitialState(overrides: Object): State {
  return {
    actors: new Set(),
    expandedPaths: new Set(),
    focusedItem: null,
    loadedProperties: new Map(),
    forceUpdated: false,
    ...overrides
  };
}

function enableStateReinitializer(props) {
  return next => (innerReducer, initialState, enhancer) => {
    function reinitializerEnhancer(state, action) {
      if (action.type !== "ROOTS_CHANGED") {
        return innerReducer(state, action);
      }

      if (props.releaseActor && initialState.actors) {
        initialState.actors.forEach(props.releaseActor);
      }

      return {
        ...action.data,
        actors: new Set(),
        expandedPaths: new Set(),
        loadedProperties: new Map(),
        // Indicates to the component that we do want to render on the next
        // render cycle.
        forceUpdate: true
      };
    }
    return next(reinitializerEnhancer, initialState, enhancer);
  };
}

module.exports = (props: Props) => {
  const middlewares = [thunk];

  if (props.injectWaitService) {
    middlewares.push(waitUntilService);
  }

  return createStore(
    reducer,
    createInitialState(props),
    compose(
      applyMiddleware(...middlewares),
      enableStateReinitializer(props)
    )
  );
};
