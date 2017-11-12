/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";

import actions from "../../actions";
import type { Scope, Pause } from "debugger-html";
import { getChromeScopes, getLoadedObjects, getPause } from "../../selectors";
import Svg from "../shared/Svg";
import ManagedTree from "../shared/ManagedTree";
import "./Scopes.css";

// check to see if its an object with propertie
function nodeHasProperties(item) {
  return !nodeHasChildren(item) && item.contents.value.type === "object";
}

function nodeIsPrimitive(item) {}

function nodeHasChildren(item) {
  return Array.isArray(item.contents);
}

function createNode(name, path, contents) {
  // The path is important to uniquely identify the item in the entire
  // tree. This helps debugging & optimizes React's rendering of large
  // lists. The path will be separated by property name,
  // i.e. `{ foo: { bar: { baz: 5 }}}` will have a path of `foo/bar/baz`
  // for the inner object.
  return { name, path, contents };
}

type Props = {
  scopes: Array<Scope>,
  loadedObjects: Map<string, any>,
  loadObjectProperties: Object => void,
  pauseInfo: Pause
};

class Scopes extends Component<Props> {
  objectCache: Object;
  getChildren: Function;
  onExpand: Function;
  renderItem: Function;

  constructor(...args) {
    super(...args);

    // Cache of dynamically built nodes. We shouldn't need to clear
    // this out ever, since we don't ever "switch out" the object
    // being inspected.
    this.objectCache = {};

    this.getChildren = this.getChildren.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  makeNodesForProperties(objProps, parentPath) {
    const { ownProperties, prototype } = objProps;

    const nodes = Object.keys(ownProperties)
      .sort()
      // Ignore non-concrete values like getters and setters
      // for now by making sure we have a value.
      .filter(name => "value" in ownProperties[name])
      .map(name =>
        createNode(name, `${parentPath}/${name}`, ownProperties[name])
      );

    // Add the prototype if it exists and is not null
    if (prototype && prototype.type !== "null") {
      nodes.push(
        createNode("__proto__", `${parentPath}/__proto__`, {
          value: prototype
        })
      );
    }

    return nodes;
  }

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const notEnumberable = false;
    const objectValue = "";

    return (
      <div
        className={classnames("node object-node", {
          focused: false,
          "not-enumerable": notEnumberable
        })}
        style={{ marginLeft: depth * 15 }}
        key={item.path}
        onClick={e => {
          e.stopPropagation();
          setExpanded(item, !expanded);
        }}
      >
        <Svg
          name="arrow"
          className={classnames({
            expanded,
            hidden: nodeIsPrimitive(item)
          })}
        />
        <span className="object-label">{item.name}</span>
        <span className="object-delimiter">{objectValue ? ": " : ""}</span>
        <span className="object-value">{objectValue || ""}</span>
      </div>
    );
  }

  getObjectProperties(item) {
    this.props.loadedObjects[item.contents.value.objectId];
  }

  getChildren(item) {
    const obj = item.contents;

    // Nodes can either have children already, or be an object with
    // properties that we need to go and fetch.
    if (nodeHasChildren(item)) {
      return item.contents;
    } else if (nodeHasProperties(item)) {
      const objectId = obj.value.objectId;

      // Because we are dynamically creating the tree as the user
      // expands it (not precalcuated tree structure), we cache child
      // arrays. This not only helps performance, but is necessary
      // because the expanded state depends on instances of nodes
      // being the same across renders. If we didn't do this, each
      // node would be a new instance every render.
      const key = item.path;
      if (this.objectCache[key]) {
        return this.objectCache[key];
      }

      const loadedProps = this.getObjectProperties(item);
      if (loadedProps) {
        const children = this.makeNodesForProperties(loadedProps, item.path);
        this.objectCache[objectId] = children;
        return children;
      }
      return [];
    }
    return [];
  }

  onExpand(item) {
    const { loadObjectProperties } = this.props;

    if (nodeHasProperties(item)) {
      loadObjectProperties(item.contents.value);
    }
  }

  getRoots() {
    return this.props.scopes.map(scope => {
      const name = scope.name || (scope.type == "global" ? "Window" : "");

      return {
        name: name,
        path: name,
        contents: { value: scope.object }
      };
    });
  }

  render() {
    const { pauseInfo } = this.props;

    if (!pauseInfo) {
      return (
        <div className={classnames("pane", "scopes-list")}>
          <div className="pane-info">{L10N.getStr("scopes.notPaused")}</div>
        </div>
      );
    }

    const roots = this.getRoots();

    return (
      <div className={classnames("pane", "scopes-list")}>
        <ManagedTree
          itemHeight={20}
          getParent={item => null}
          getChildren={this.getChildren}
          getRoots={() => roots}
          getPath={item => item.path}
          autoExpand={0}
          autoExpandDepth={1}
          autoExpandAll={false}
          disabledFocus={true}
          onExpand={this.onExpand}
          renderItem={this.renderItem}
        />
      </div>
    );
  }
}

export default connect(
  state => ({
    pauseInfo: getPause(state),
    loadedObjects: getLoadedObjects(state),
    scopes: getChromeScopes(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
