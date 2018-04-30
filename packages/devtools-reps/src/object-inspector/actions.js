/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type {
  CreateLongStringClient,
  CreateObjectClient,
  GripProperties,
  LoadedProperties,
  Node,
  Props,
  ReduxAction
} from "./types";

const { loadItemProperties } = require("./utils/load-properties");

type Dispatch = ReduxAction => void;

type ThunkArg = {
  getState: () => {},
  dispatch: Dispatch
};

/**
 * This action is responsible for expanding a given node, which also means that
 * it will call the action responsible to fetch properties.
 */
function nodeExpand(
  node: Node,
  actor?: string,
  loadedProperties: LoadedProperties,
  createObjectClient: CreateObjectClient,
  createLongStringClient: CreateLongStringClient
) {
  return async ({ dispatch }: ThunkArg) => {
    dispatch({
      type: "NODE_EXPAND",
      data: { node }
    });

    if (!loadedProperties.has(node.path)) {
      dispatch(
        nodeLoadProperties(
          node,
          actor,
          loadedProperties,
          createObjectClient,
          createLongStringClient
        )
      );
    }
  };
}

function nodeCollapse(node: Node) {
  return {
    type: "NODE_COLLAPSE",
    data: { node }
  };
}

function nodeFocus(node: Node) {
  return {
    type: "NODE_FOCUS",
    data: { node }
  };
}
/*
 * This action checks if we need to fetch properties, entries, prototype and
 * symbols for a given node. If we do, it will call the appropriate ObjectClient
 * functions.
 */
function nodeLoadProperties(
  item: Node,
  actor?: string,
  loadedProperties: LoadedProperties,
  createObjectClient: CreateObjectClient,
  createLongStringClient: CreateLongStringClient
) {
  return async ({ dispatch }: ThunkArg) => {
    try {
      const properties = await loadItemProperties(
        item,
        createObjectClient,
        createLongStringClient,
        loadedProperties
      );
      dispatch(nodePropertiesLoaded(item, actor, properties));
    } catch (e) {
      console.error(e);
    }
  };
}

function nodePropertiesLoaded(
  node: Node,
  actor?: string,
  properties: GripProperties
) {
  return {
    type: "NODE_PROPERTIES_LOADED",
    data: { node, actor, properties }
  };
}

/*
 * This action is dispatched when the `roots` prop, provided by a consumer of
 * the ObjectInspector (inspector, console, …), is modified. It will clean the
 * internal state properties (expandedPaths, loadedProperties, …) and release
 * the actors consumed with the previous roots.
 * It takes a props argument which reflects what is passed by the upper-level
 * consumer.
 */
function rootsChanged(props: Props) {
  return {
    type: "ROOTS_CHANGED",
    data: props
  };
}

/*
 * This action will reset the `forceUpdate` flag in the state.
 */
function forceUpdated() {
  return {
    type: "FORCE_UPDATED"
  };
}

module.exports = {
  forceUpdated,
  nodeExpand,
  nodeCollapse,
  nodeFocus,
  nodeLoadProperties,
  nodePropertiesLoaded,
  rootsChanged
};
