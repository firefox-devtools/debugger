/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
// @flow

import type { ReduxAction, State } from "./types";

function initialState() {
  return {
    expandedPaths: new Set(),
    loadedProperties: new Map(),
    actors: new Set(),
    focusedItem: null,
    forceUpdate: false
  };
}

function reducer(
  state: State = initialState(),
  action: ReduxAction = {}
): State {
  const { type, data } = action;

  const cloneState = overrides => ({ ...state, ...overrides });

  if (type === "NODE_EXPAND") {
    return cloneState({
      expandedPaths: new Set(state.expandedPaths).add(data.node.path)
    });
  }

  if (type === "NODE_COLLAPSE") {
    const expandedPaths = new Set(state.expandedPaths);
    expandedPaths.delete(data.node.path);
    return cloneState({ expandedPaths });
  }

  if (type === "NODE_PROPERTIES_LOADED") {
    return cloneState({
      actors: data.actor
        ? new Set(state.actors || []).add(data.actor)
        : state.actors,
      loadedProperties: new Map(state.loadedProperties).set(
        data.node.path,
        action.data.properties
      )
    });
  }

  if (type === "NODE_FOCUS") {
    if (state.focusedItem === data.node) {
      return state;
    }

    return cloneState({ focusedItem: data.node });
  }

  if (type === "FORCE_UPDATED") {
    return cloneState({ forceUpdate: false });
  }

  return state;
}

function getObjectInspectorState(state) {
  return state.objectInspector;
}

function getExpandedPaths(state) {
  return getObjectInspectorState(state).expandedPaths;
}

function getExpandedPathKeys(state) {
  return [...getExpandedPaths(state).keys()];
}

function getActors(state) {
  return getObjectInspectorState(state).actors;
}

function getLoadedProperties(state) {
  return getObjectInspectorState(state).loadedProperties;
}

function getLoadedPropertyKeys(state) {
  return [...getLoadedProperties(state).keys()];
}

function getForceUpdate(state) {
  return getObjectInspectorState(state).forceUpdate;
}

function getFocusedItem(state) {
  console.log("getFocusedItem", getObjectInspectorState(state).focusedItem);
  return getObjectInspectorState(state).focusedItem;
}

const selectors = {
  getExpandedPaths,
  getExpandedPathKeys,
  getActors,
  getLoadedProperties,
  getLoadedPropertyKeys,
  getForceUpdate,
  getFocusedItem
};

Object.defineProperty(module.exports, "__esModule", {
  value: true
});
module.exports = selectors;
module.exports.default = reducer;
