// @flow
import { DOM as dom, PropTypes, createFactory, Component } from "react";
import classnames from "classnames";
import Svg from "./Svg";
import Rep from "./Rep";
import previewFunction from "./previewFunction";
import { MODE } from "devtools-reps";
import {
  nodeIsOptimizedOut,
  nodeIsMissingArguments,
  nodeHasProperties,
  nodeIsFunction,
  nodeIsPrimitive,
  isDefault,
  getChildren,
  createNode
} from "../../utils/object-inspector";

import _ManagedTree from "./ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import "./ObjectInspector.css";

export type ObjectInspectorItemContentsValue = {
  actor: string,
  class: string,
  displayClass: string,
  extensible: boolean,
  frozen: boolean,
  ownPropertyLength: number,
  preview: Object,
  sealed: boolean,
  type: string
};

export type ObjectInspectorItemContents = {
  value: ObjectInspectorItemContentsValue
};

export type ObjectInspectorItem = {
  contents: Array<ObjectInspectorItem> & ObjectInspectorItemContents,
  name: string,
  path: string
};

type DefaultProps = {
  onDoubleClick: (
    item: ObjectInspectorItem,
    params: {
      depth: number,
      focused: boolean,
      expanded: boolean
    }
  ) => void,
  autoExpandDepth: number
};

// This implements a component that renders an interactive inspector
// for looking at JavaScript objects. It expects descriptions of
// objects from the protocol, and will dynamically fetch child
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

class ObjectInspector extends Component {
  static defaultProps: DefaultProps;
  actors: any;

  constructor() {
    super();

    this.actors = {};

    const self: any = this;
    self.getChildren = this.getChildren.bind(this);
    self.renderItem = this.renderItem.bind(this);
  }

  getChildren(item: ObjectInspectorItem) {
    const { getObjectProperties } = this.props;
    const { actors } = this;

    return getChildren({
      getObjectProperties,
      actors,
      item
    });
  }

  renderItem(
    item: ObjectInspectorItem,
    depth: number,
    focused: boolean,
    _: Object,
    expanded: boolean,
    { setExpanded }: () => any
  ) {
    let objectValue;
    let label = item.name;
    const unavailable =
      nodeIsPrimitive(item) &&
      item.contents.value.hasOwnProperty("unavailable");
    if (nodeIsOptimizedOut(item)) {
      objectValue = dom.span({ className: "unavailable" }, "(optimized away)");
    } else if (nodeIsMissingArguments(item) || unavailable) {
      objectValue = dom.span({ className: "unavailable" }, "(unavailable)");
    } else if (nodeIsFunction(item)) {
      objectValue = null;
      label = previewFunction({ name: label, parameterNames: [] });
    } else if (nodeHasProperties(item) || nodeIsPrimitive(item)) {
      const object = item.contents.value;
      objectValue = Rep({ object, mode: MODE.TINY });
    }

    return dom.div(
      {
        className: classnames("node object-node", {
          focused,
          "default-property": isDefault(item)
        }),
        style: {
          marginLeft: depth * 15 + (nodeIsPrimitive(item) ? 15 : 0)
        },
        onClick: e => {
          e.stopPropagation();
          setExpanded(item, !expanded);
        },
        onDoubleClick: event => {
          event.stopPropagation();
          this.props.onDoubleClick(item, {
            depth,
            focused,
            expanded
          });
        }
      },
      Svg("arrow", {
        className: classnames({
          expanded: expanded,
          hidden: nodeIsPrimitive(item)
        })
      }),
      dom.span(
        {
          className: "object-label",
          dir: "ltr"
        },
        label
      ),
      dom.span({ className: "object-delimiter" }, objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || "")
    );
  }

  render() {
    const { name, desc, loadObjectProperties, autoExpandDepth } = this.props;

    let roots = this.props.roots;
    if (!roots) {
      roots = [createNode(name, name, desc)];
    }

    return ManagedTree({
      itemHeight: 20,
      getParent: item => null,
      getChildren: this.getChildren,
      getRoots: () => roots,
      getKey: item => item.path,
      autoExpand: 0,
      autoExpandDepth,
      autoExpandAll: false,
      disabledFocus: true,
      onExpand: item => {
        if (nodeHasProperties(item)) {
          loadObjectProperties(item.contents.value);
        }
      },
      renderItem: this.renderItem
    });
  }
}

ObjectInspector.displayName = "ObjectInspector";

ObjectInspector.propTypes = {
  autoExpandDepth: PropTypes.number,
  name: PropTypes.string,
  desc: PropTypes.object,
  roots: PropTypes.array,
  getObjectProperties: PropTypes.func.isRequired,
  loadObjectProperties: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired
};

ObjectInspector.defaultProps = {
  onDoubleClick: () => {},
  autoExpandDepth: 1
};

export default ObjectInspector;
