/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const { Component, createFactory, createElement } = require("react");
const { connect } = require("react-redux");
const actions = require("../actions");

const selectors = require("../reducer");

import Components from "devtools-components";
const Tree = createFactory(Components.Tree);
require("./ObjectInspector.css");

const ObjectInspectorItem = createFactory(require("./ObjectInspectorItem"));

const classnames = require("classnames");

const Utils = require("../utils");
const { renderRep, shouldRenderRootsInReps } = Utils;
const {
  getChildren,
  getActor,
  getParent,
  nodeHasAccessors,
  nodeIsPrimitive
} = Utils.node;

import type { CachedNodes, Props } from "../types";

type DefaultProps = {
  autoExpandAll: boolean,
  autoExpandDepth: number
};

// This implements a component that renders an interactive inspector
// for looking at JavaScript objects. It expects descriptions of
// objects from the protocol, and will dynamically fetch children
// properties as objects are expanded.
//
// If you want to inspect a single object, pass the name and the
// protocol descriptor of it:
//
//  ObjectInspector({
//    name: "foo",
//    desc: { writable: true, ..., { value: { actor: "1", ... }}},
//    ...
//  })
//
// If you want multiple top-level objects (like scopes), you can pass
// an array of manually constructed nodes as `roots`:
//
//  ObjectInspector({
//    roots: [{ name: ... }, ...],
//    ...
//  });

// There are 3 types of nodes: a simple node with a children array, an
// object that has properties that should be children when they are
// fetched, and a primitive value that should be displayed with no
// children.

class ObjectInspector extends Component<Props> {
  static defaultProps: DefaultProps;
  constructor(props: Props) {
    super();
    this.cachedNodes = new Map();

    const self: any = this;

    self.getItemChildren = this.getItemChildren.bind(this);
    self.setExpanded = this.setExpanded.bind(this);
    self.focusItem = this.focusItem.bind(this);
    self.getRoots = this.getRoots.bind(this);
  }

  componentWillMount() {
    this.roots = this.props.roots;
    this.focusedItem = this.props.focusedItem;
  }

  componentWillUpdate(nextProps) {
    if (this.roots !== nextProps.roots) {
      // Since the roots changed, we assume the properties did as well,
      // so we need to cleanup the component internal state.

      // We can clear the cachedNodes to avoid bugs and memory leaks.
      this.cachedNodes.clear();
      this.roots = nextProps.roots;
      this.focusedItem = nextProps.focusedItem;
      if (this.props.rootsChanged) {
        this.props.rootsChanged();
      }
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    const { expandedPaths, loadedProperties } = this.props;

    // We should update if:
    // - there are new loaded properties
    // - OR the expanded paths number changed, and all of them have properties
    //      loaded
    // - OR the expanded paths number did not changed, but old and new sets
    //      differ
    // - OR the focused node changed.
    return (
      loadedProperties.size !== nextProps.loadedProperties.size ||
      (expandedPaths.size !== nextProps.expandedPaths.size &&
        [...nextProps.expandedPaths].every(path =>
          nextProps.loadedProperties.has(path)
        )) ||
      (expandedPaths.size === nextProps.expandedPaths.size &&
        [...nextProps.expandedPaths].some(key => !expandedPaths.has(key))) ||
      this.focusedItem !== nextProps.focusedItem ||
      this.roots !== nextProps.roots
    );
  }

  componentWillUnmount() {
    this.props.closeObjectInspector();
  }

  props: Props;
  cachedNodes: CachedNodes;

  getItemChildren(item: Node): Array<Node> | NodeContents | null {
    const { loadedProperties } = this.props;
    const { cachedNodes } = this;

    return getChildren({
      loadedProperties,
      cachedNodes,
      item
    });
  }

  getRoots(): Array<Node> {
    return this.props.roots;
  }

  getNodeKey(item: Node): string {
    return item.path && typeof item.path.toString === "function"
      ? item.path.toString()
      : JSON.stringify(item);
  }

  setExpanded(item: Node, expand: boolean) {
    if (nodeIsPrimitive(item)) {
      return;
    }

    const {
      nodeExpand,
      nodeCollapse,
      recordTelemetryEvent,
      roots
    } = this.props;

    if (expand === true) {
      const actor = getActor(item, roots);
      nodeExpand(item, actor);
      if (recordTelemetryEvent) {
        recordTelemetryEvent("object_expanded");
      }
    } else {
      nodeCollapse(item);
    }
  }

  focusItem(item: Node) {
    const { focusable = true, onFocus } = this.props;

    if (focusable && this.focusedItem !== item) {
      this.focusedItem = item;
      this.forceUpdate();

      if (onFocus) {
        onFocus(item);
      }
    }
  }

  render() {
    const {
      autoExpandAll = true,
      autoExpandDepth = 1,
      focusable = true,
      disableWrap = false,
      expandedPaths,
      inline
    } = this.props;

    return Tree({
      className: classnames({
        inline,
        nowrap: disableWrap,
        "object-inspector": true
      }),

      autoExpandAll,
      autoExpandDepth,

      isExpanded: item => expandedPaths && expandedPaths.has(item.path),
      // TODO: We don't want property with getters to be expandable until we
      // do have a mechanism to invoke the getter (See #6140).
      isExpandable: item => !nodeIsPrimitive(item) && !nodeHasAccessors(item),
      focused: this.focusedItem,

      getRoots: this.getRoots,
      getParent,
      getChildren: this.getItemChildren,
      getKey: this.getNodeKey,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: focusable ? this.focusItem : null,

      renderItem: (item, depth, focused, arrow, expanded) =>
        ObjectInspectorItem({
          item,
          depth,
          focused,
          arrow,
          expanded,
          ...this.props,
          setExpanded: this.setExpanded
        })
    });
  }
}

function mapStateToProps(state, props) {
  return {
    expandedPaths: selectors.getExpandedPaths(state),
    loadedProperties: selectors.getLoadedProperties(state)
  };
}

const OI = connect(
  mapStateToProps,
  actions
)(ObjectInspector);

module.exports = (props: Props) => {
  const { roots } = props;
  if (shouldRenderRootsInReps(roots)) {
    return renderRep(roots[0], props);
  }

  return createElement(OI, props);
};
