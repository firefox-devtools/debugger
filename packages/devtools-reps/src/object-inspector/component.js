/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const { Component, createFactory } = require("react");
const dom = require("react-dom-factories");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");

import Components from "devtools-components";
const Tree = createFactory(Components.Tree);
require("./index.css");

const classnames = require("classnames");
const { MODE } = require("../reps/constants");

const Utils = require("./utils");

const {
  getChildren,
  getClosestGripNode,
  getParent,
  getValue,
  nodeHasAccessors,
  nodeHasProperties,
  nodeIsBlock,
  nodeIsDefaultProperties,
  nodeIsFunction,
  nodeIsGetter,
  nodeIsMapEntry,
  nodeIsMissingArguments,
  nodeIsOptimizedOut,
  nodeIsPrimitive,
  nodeIsPrototype,
  nodeIsSetter,
  nodeIsUninitializedBinding,
  nodeIsUnmappedBinding,
  nodeIsUnscopedBinding,
  nodeIsWindow,
  nodeIsLongString,
  nodeHasFullText
} = Utils.node;

import type { CachedNodes, Node, NodeContents, Props } from "./types";

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
    self.renderTreeItem = this.renderTreeItem.bind(this);
    self.setExpanded = this.setExpanded.bind(this);
    self.focusItem = this.focusItem.bind(this);
    self.getRoots = this.getRoots.bind(this);
  }

  shouldComponentUpdate(nextProps: Props) {
    const { expandedPaths, focusedItem, loadedProperties, roots } = this.props;

    if (roots !== nextProps.roots) {
      // Since the roots changed, we assume the properties did as well,
      // so we need to cleanup the component internal state.

      // We can clear the cachedNodes to avoid bugs and memory leaks.
      this.cachedNodes.clear();
      // The rootsChanged action will be handled in a middleware to release the
      // actors of the old roots, as well as cleanup the state properties
      // (expandedPaths, loadedProperties, …).
      this.props.rootsChanged(nextProps);
      // We don't render right away since the state is going to be changed by
      // the rootsChanged action. The `state.forceUpdate` flag will be set
      // to `true` so we can execute a new render cycle with the cleaned state.
      return false;
    }

    if (nextProps.forceUpdate === true) {
      return true;
    }

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
      focusedItem !== nextProps.focusedItem
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.forceUpdate) {
      // If the component was updated, we can then reset the forceUpdate flag.
      this.props.forceUpdated();
    }
  }

  componentWillUnmount() {
    const { releaseActor } = this.props;
    if (typeof releaseActor !== "function") {
      return;
    }

    const { actors } = this.props;
    for (const actor of actors) {
      releaseActor(actor);
    }
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
      createObjectClient,
      createLongStringClient,
      loadedProperties,
      nodeExpand,
      nodeCollapse,
      roots
    } = this.props;

    if (expand === true) {
      const gripItem = getClosestGripNode(item);
      const value = getValue(gripItem);
      const isRoot =
        value &&
        roots.some(root => {
          const rootValue = getValue(root);
          return rootValue && rootValue.actor === value.actor;
        });
      const actor = isRoot || !value ? null : value.actor;
      nodeExpand(
        item,
        actor,
        loadedProperties,
        createObjectClient,
        createLongStringClient
      );
    } else {
      nodeCollapse(item);
    }
  }

  focusItem(item: Node) {
    const { focusable = true, focusedItem, nodeFocus, onFocus } = this.props;

    if (focusable && focusedItem !== item) {
      nodeFocus(item);
      if (focusedItem !== item && onFocus) {
        onFocus(item);
      }
    }
  }

  // eslint-disable-next-line complexity
  getTreeItemLabelAndValue(
    item: Node,
    depth: number,
    expanded: boolean
  ): {
    value?: string | Element,
    label?: string
  } {
    const label = item.name;
    const isPrimitive = nodeIsPrimitive(item);

    if (nodeIsOptimizedOut(item)) {
      return {
        label,
        value: dom.span({ className: "unavailable" }, "(optimized away)")
      };
    }

    if (nodeIsUninitializedBinding(item)) {
      return {
        label,
        value: dom.span({ className: "unavailable" }, "(uninitialized)")
      };
    }

    if (nodeIsUnmappedBinding(item)) {
      return {
        label,
        value: dom.span({ className: "unavailable" }, "(unmapped)")
      };
    }

    if (nodeIsUnscopedBinding(item)) {
      return {
        label,
        value: dom.span({ className: "unavailable" }, "(unscoped)")
      };
    }

    const itemValue = getValue(item);
    const unavailable =
      isPrimitive &&
      itemValue &&
      itemValue.hasOwnProperty &&
      itemValue.hasOwnProperty("unavailable");

    if (nodeIsMissingArguments(item) || unavailable) {
      return {
        label,
        value: dom.span({ className: "unavailable" }, "(unavailable)")
      };
    }

    if (
      nodeIsFunction(item) &&
      !nodeIsGetter(item) &&
      !nodeIsSetter(item) &&
      (this.props.mode === MODE.TINY || !this.props.mode)
    ) {
      return {
        label: Utils.renderRep(item, {
          ...this.props,
          functionName: label
        })
      };
    }

    if (
      nodeHasProperties(item) ||
      nodeHasAccessors(item) ||
      nodeIsMapEntry(item) ||
      nodeIsLongString(item) ||
      isPrimitive
    ) {
      const repProps = { ...this.props };
      if (depth > 0) {
        repProps.mode = this.props.mode === MODE.LONG ? MODE.SHORT : MODE.TINY;
      }
      if (expanded) {
        repProps.mode = MODE.TINY;
      }

      if (nodeIsLongString(item)) {
        repProps.member = {
          open: nodeHasFullText(item) && expanded
        };
      }

      return {
        label,
        value: Utils.renderRep(item, repProps)
      };
    }

    return {
      label
    };
  }

  renderTreeItemLabel(
    label,
    item: Node,
    depth: number,
    focused: boolean,
    expanded: boolean
  ) {
    if (label === null || typeof label === "undefined") {
      return null;
    }

    const { onLabelClick } = this.props;

    return dom.span(
      {
        className: "object-label",
        onClick: onLabelClick
          ? event => {
              event.stopPropagation();

              // If the user selected text, bail out.
              if (Utils.selection.documentHasSelection()) {
                return;
              }

              onLabelClick(item, {
                depth,
                focused,
                expanded,
                setExpanded: this.setExpanded
              });
            }
          : undefined
      },
      label
    );
  }

  getTreeTopElementProps(
    item: Node,
    depth: number,
    focused: boolean,
    expanded: boolean
  ): Object {
    const { onCmdCtrlClick, onDoubleClick, dimTopLevelWindow } = this.props;

    const parentElementProps: Object = {
      className: classnames("node object-node", {
        focused,
        lessen:
          !expanded &&
          (nodeIsDefaultProperties(item) ||
            nodeIsPrototype(item) ||
            (dimTopLevelWindow === true && nodeIsWindow(item) && depth === 0)),
        block: nodeIsBlock(item)
      }),
      onClick: e => {
        if (e.metaKey && onCmdCtrlClick) {
          onCmdCtrlClick(item, {
            depth,
            event: e,
            focused,
            expanded
          });
          e.stopPropagation();
          return;
        }

        // If this click happened because the user selected some text, bail out.
        // Note that if the user selected some text before and then clicks here,
        // the previously selected text will be first unselected, unless the
        // user clicked on the arrow itself. Indeed because the arrow is an
        // image, clicking on it does not remove any existing text selection.
        // So we need to also check if the arrow was clicked.
        if (
          Utils.selection.documentHasSelection() &&
          !(e.target && e.target.matches && e.target.matches(".arrow"))
        ) {
          e.stopPropagation();
        }
      }
    };

    if (onDoubleClick) {
      parentElementProps.onDoubleClick = e => {
        e.stopPropagation();
        onDoubleClick(item, {
          depth,
          focused,
          expanded
        });
      };
    }

    return parentElementProps;
  }

  renderTreeItem(
    item: Node,
    depth: number,
    focused: boolean,
    arrow: Object,
    expanded: boolean
  ) {
    const { label, value } = this.getTreeItemLabelAndValue(
      item,
      depth,
      expanded
    );
    const labelElement = this.renderTreeItemLabel(
      label,
      item,
      depth,
      focused,
      expanded
    );
    const delimiter =
      value && labelElement
        ? dom.span({ className: "object-delimiter" }, ": ")
        : null;

    return dom.div(
      this.getTreeTopElementProps(item, depth, focused, expanded),
      arrow,
      labelElement,
      delimiter,
      value
    );
  }

  render() {
    const {
      autoExpandAll = true,
      autoExpandDepth = 1,
      focusable = true,
      disableWrap = false,
      expandedPaths,
      focusedItem,
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
      isExpandable: item => nodeIsPrimitive(item) === false,
      focused: focusedItem,

      getRoots: this.getRoots,
      getParent,
      getChildren: this.getItemChildren,
      getKey: this.getNodeKey,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: focusable ? this.focusItem : null,

      renderItem: this.renderTreeItem
    });
  }
}

function mapStateToProps(state, props) {
  return {
    actors: state.actors,
    expandedPaths: state.expandedPaths,
    // If the root changes, we want to pass a possibly new focusedItem property
    focusedItem:
      state.roots !== props.roots ? props.focusedItem : state.focusedItem,
    loadedProperties: state.loadedProperties,
    forceUpdate: state.forceUpdate
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(require("./actions"), dispatch);
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ObjectInspector);
