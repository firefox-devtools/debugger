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
  getActor,
  getNodeKey,
  getParent,
  nodeIsPrimitive,
  nodeHasGetter,
  nodeHasSetter,
  nodeHasGetterValue
} = Utils.node;

import type { Props } from "../types";

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

    const self: any = this;

    self.isNodeExpandable = this.isNodeExpandable.bind(this);
    self.setExpanded = this.setExpanded.bind(this);
    self.focusItem = this.focusItem.bind(this);
    self.getRoots = this.getRoots.bind(this);
    self.getNodeStringKey = this.getNodeStringKey.bind(this);
  }

  componentWillMount() {
    this.roots = this.props.roots;
    this.focusedItem = this.props.focusedItem;

    this.props.rootsChanged({ newRoots: this.roots });
  }

  componentWillUpdate(nextProps) {
    if (this.roots !== nextProps.roots) {
      console.info(
        "componentWillUpdate - roots changes",
        this.roots,
        nextProps.roots
      );
      // Since the roots changed, we assume the properties did as well,
      // so we need to cleanup the component internal state.
      this.roots = nextProps.roots;
      this.focusedItem = nextProps.focusedItem;
      this.props.rootsChanged({
        oldRoots: this.props.roots,
        nextRoots: this.roots
      });
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    const { expandedPaths, loadedProperties, nodes, evaluations } = this.props;

    // We should update if:
    // - there are new nodes
    // - there are new evaluations
    // - OR there are less expanded nodes
    // - OR there are more expanded nodes, and all of them have properties
    //      loaded
    // - OR the expanded paths number did not changed, but old and new sets
    //      differ
    // - OR the focused node changed.
    // - OR the roots changed.
    return (
      nodes.size !== nextProps.nodes.size ||
      evaluations.size !== nextProps.evaluations.size ||
      loadedProperties.length !== nextProps.loadedProperties.length ||
      expandedPaths.size > nextProps.expandedPaths.size ||
      (expandedPaths.size < nextProps.expandedPaths.size &&
        [...nextProps.expandedPaths].every(path =>
          nextProps.loadedProperties.includes(path)
        )) ||
      (expandedPaths.size === nextProps.expandedPaths.size &&
        [...nextProps.expandedPaths].some(key => !expandedPaths.has(key))) ||
      this.focusedItem !== nextProps.focusedItem ||
      this.roots !== nextProps.roots
    );
  }

  componentWillUnmount() {
    this.props.rootsChanged({ oldRoots: this.props.roots });
  }

  props: Props;

  getRoots(): Array<Node> {
    return this.roots;
  }

  getNodeStringKey(item: Node): string {
    const key = getNodeKey(item);
    if (key && typeof key.toString === "function") {
      return key.toString();
    }

    return JSON.stringify(item);
  }

  isNodeExpandable(item: Node): boolean {
    if (
      !nodeHasGetterValue(item) &&
      (nodeHasSetter(item) || nodeHasGetter(item))
    ) {
      return false;
    }

    if (nodeIsPrimitive(item)) {
      return false;
    }

    return true;
  }

  setExpanded(item: Node, expand: boolean) {
    if (!this.isNodeExpandable(item)) {
      return;
    }

    const { nodeExpand, nodeCollapse, recordTelemetryEvent } = this.props;

    if (expand === true) {
      const actor = getActor(item, this.roots);
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
      inline,
      getNodeChildren,
      evaluations
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
      isExpandable: this.isNodeExpandable,
      focused: this.focusedItem,

      getRoots: this.getRoots,
      getParent,
      getChildren: getNodeChildren,
      getKey: this.getNodeStringKey,
      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: focusable ? this.focusItem : null,

      renderItem: (item, depth, focused, arrow, expanded) =>
        ObjectInspectorItem({
          ...this.props,
          item,
          depth,
          focused,
          arrow,
          expanded,
          setExpanded: this.setExpanded,
          evaluation: evaluations.get(getNodeKey(item))
        })
    });
  }
}

function mapStateToProps(state, props) {
  const { roots } = props;
  return {
    expandedPaths: selectors.getExpandedPathsFromRoots(state, roots),
    evaluations: selectors.getEvaluationsFromRoots(state, roots),
    loadedProperties: selectors.getLoadedPropertyKeysFromRoots(state, roots),
    getNodeChildren: node => selectors.getNodeChildren(state, node),
    nodes: selectors.getNodesFromRoots(state, roots)
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
