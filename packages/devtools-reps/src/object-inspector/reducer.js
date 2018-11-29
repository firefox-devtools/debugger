/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
// @flow

import type { ReduxAction, State, Node } from "./types";

const {
  getChildren,
  getNodeKey,
  nodeHasValue,
  nodeHasGetterValue
} = require("./utils").node;

function initialState(): State {
  return {
    // A set of node key
    expandedPaths: new Set(),
    // A map of the following form Map<NodeKey, Object>
    loadedProperties: new Map(),
    // A map of the following form Map<NodeKey, Timestamp>
    evaluations: new Map(),
    // A map of the following form Map<NodeKey, String>
    actors: new Map(),
    // A map of the following form Map<NodeKey, Node>
    nodes: new Map(),
    // A map of the following form Map<NodeKey, Array<NodeKey>>
    children: new Map()
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
      expandedPaths: new Set(state.expandedPaths).add(getNodeKey(data.node))
    });
  }

  if (type === "NODE_COLLAPSE") {
    const expandedPaths = new Set(state.expandedPaths);
    expandedPaths.delete(getNodeKey(data.node));
    return cloneState({ expandedPaths });
  }

  if (type === "NODE_PROPERTIES_LOADED") {
    const key = getNodeKey(data.node);
    const newLoadedProperties = new Map(state.loadedProperties).set(
      key,
      action.data.properties
    );

    const newNodes = new Map(state.nodes);
    let newChildren;
    if (action.data.properties && action.data.properties.fullText) {
      newNodes.set(key, setNodeFullText(action.data.properties, data.node));
    } else {
      newChildren = new Map(state.children);
      const children = getChildren({
        item: data.node,
        loadedProperties: newLoadedProperties
      });

      const childrenIds = [];
      for (const child of children) {
        const childKey = getNodeKey(child);
        newNodes.set(childKey, child);
        childrenIds.push(childKey);
      }
      newChildren.set(key, childrenIds);
    }

    return cloneState({
      actors: data.actor
        ? new Map(state.actors || []).set(key, data.actor)
        : state.actors,
      loadedProperties: newLoadedProperties,
      nodes: newNodes,
      children: newChildren || state.children
    });
  }

  if (type === "ROOTS_CHANGED") {
    if (!data) {
      return cloneState();
    }

    const { oldRoots, newRoots } = data;
    return rootsChanged(state, oldRoots, newRoots);
  }

  if (type === "GETTER_INVOKED") {
    const key = data.node.path;
    const oldNode = state.nodes.get(key);
    const getterValue =
      data.result &&
      data.result.value &&
      (data.result.value.return || data.result.value.throw);

    return cloneState({
      actors: data.actor
        ? new Set(state.actors || []).add(data.result.from)
        : state.actors,
      evaluations: new Map(state.evaluations).set(key, Date.now()),
      nodes: new Map(state.nodes).set(key, {
        ...oldNode,
        contents: {
          ...(oldNode.contents || {}),
          getterValue
        }
      })
    });
  }

  // NOTE: we clear the state on resume because otherwise the scopes pane
  // would be out of date. Bug 1514760
  if (type === "RESUME" || type == "NAVIGATE") {
    return initialState();
  }

  return state;
}

function rootsChanged(state, oldRoots, newRoots) {
  const newState = { ...state };

  if (oldRoots) {
    const cleanMap = map => cleanStateMap(state, map, oldRoots);
    // Let's remove from the state any reference to the old roots.
    Object.assign(newState, {
      actors: cleanMap(newState.actors),
      children: cleanMap(newState.children),
      evaluations: cleanMap(newState.evaluations),
      expandedPaths: cleanStateSet(state, newState.expandedPaths, oldRoots),
      loadedProperties: cleanMap(newState.loadedProperties),
      nodes: cleanMap(newState.children)
    });
  }

  if (newRoots) {
    const newNodes = new Map(newState.nodes);
    const newChildren = new Map(newState.children);

    const roots = Array.isArray(newRoots) ? newRoots : [newRoots];
    for (const root of roots) {
      const children = getChildren({
        item: root,
        loadedProperties: newState.loadedProperties
      });
      const childrenIds = [];
      for (const child of children) {
        const childKey = getNodeKey(child);
        newNodes.set(childKey, child);
        childrenIds.push(childKey);
      }
      newChildren.set(getNodeKey(root), childrenIds);
    }

    Object.assign(newState, {
      nodes: newNodes,
      children: newChildren
    });
  }

  return newState;
}

function setNodeFullText(loadedProps: GripProperties, node: Node): Node {
  const { fullText } = loadedProps;
  if (nodeHasValue(node)) {
    node.contents.value.fullText = fullText;
  } else if (nodeHasGetterValue(node)) {
    node.contents.getterValue.fullText = fullText;
  }

  return node;
}

function getKeysFromRoots(oiState, roots = []) {
  if (!Array.isArray(roots)) {
    roots = [roots];
  }

  const keys = roots.map(r => getNodeKey(r));
  let childrenKeys = [];
  for (const key of keys) {
    childrenKeys = childrenKeys.concat(getChildrenKeys(oiState, key));
  }

  return keys.concat(childrenKeys);
}

function getChildrenKeys(oiState, key) {
  const { children } = oiState;
  if (!children) {
    return [];
  }

  const ids = oiState.children.get(key) || [];
  let childrenKeys = [];
  for (const id of ids) {
    childrenKeys = childrenKeys.concat(getChildrenKeys(oiState, id));
  }
  return ids.concat(childrenKeys);
}

function filterMapFromRoots(state, map, roots) {
  const oiState = getObjectInspectorState(state);
  const keys = getKeysFromRoots(oiState, roots);

  const newMap = new Map();
  for (const key of keys) {
    if (map.has(key)) {
      newMap.set(key, map.get(key));
    }
  }
  return newMap;
}

function filterSetFromRoots(state, set, roots) {
  const oiState = getObjectInspectorState(state);
  const keys = getKeysFromRoots(oiState, roots);

  const newSet = new Set();
  for (const key of keys) {
    if (set.has(key)) {
      newSet.add(key);
    }
  }
  return newSet;
}

function cleanStateMap(oiState, map, roots) {
  const keys = getKeysFromRoots(oiState, roots);
  const newMap = new Map(map);
  for (const key of keys) {
    newMap.delete(key);
  }
  return newMap;
}

function cleanStateSet(oiState, set, roots) {
  const keys = getKeysFromRoots(oiState, roots);

  const newSet = new Set(set);
  for (const key of keys) {
    newSet.delete(key);
  }
  return newSet;
}

/*
 * ---------------
 * -- SELECTORS --
 * ---------------
 */

function getObjectInspectorState(state) {
  return state.objectInspector;
}

function getExpandedPathsFromRoots(state, roots) {
  const { expandedPaths } = getObjectInspectorState(state);
  return filterSetFromRoots(state, expandedPaths, roots);
}

function getActorsFromRoots(state, roots) {
  const { actors } = getObjectInspectorState(state);
  return filterMapFromRoots(state, actors, roots);
}

function getLoadedPropertiesFromRoots(state, roots) {
  const { loadedProperties } = getObjectInspectorState(state);
  return filterMapFromRoots(state, loadedProperties, roots);
}

function getLoadedPropertyKeysFromRoots(state, roots) {
  return Array.from(getLoadedPropertiesFromRoots(state, roots).keys());
}

function getNodeChildren(state, item: Node) {
  const { children, nodes } = getObjectInspectorState(state);
  const key = getNodeKey(item);
  return (children.get(key) || []).map(k => nodes.get(k));
}

function getNodesFromRoots(state, roots) {
  const oiState = getObjectInspectorState(state);
  const keys = getKeysFromRoots(oiState, roots);
  const { nodes } = getObjectInspectorState(state);
  return new Map(keys.map(key => [key, nodes.get(key)]));
}

function getEvaluations(state) {
  const { evaluations } = getObjectInspectorState(state) || {};
  return evaluations || new Map();
}

function getEvaluationsFromRoots(state, roots) {
  const oiState = getObjectInspectorState(state);
  const keys = getKeysFromRoots(oiState, roots);
  const evaluations = getEvaluations(state);

  return keys.reduce((map, key) => {
    if (evaluations.has(key)) {
      map.set(key, evaluations.get(key));
    }
    return map;
  }, new Map());
}

function getEvaluation(state, node) {
  if (!node) {
    return null;
  }

  const evaluations = getEvaluations(state);
  const key = getNodeKey(node);

  if (!evaluations || !key) {
    return null;
  }

  return evaluations.get(key);
}

const selectors = {
  getActorsFromRoots,
  getEvaluation,
  getEvaluationsFromRoots,
  getExpandedPathsFromRoots,
  getNodesFromRoots,
  getLoadedPropertiesFromRoots,
  getLoadedPropertyKeysFromRoots,
  getNodeChildren
};

Object.defineProperty(module.exports, "__esModule", {
  value: true
});
module.exports = selectors;
module.exports.default = reducer;
