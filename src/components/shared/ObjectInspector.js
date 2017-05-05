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

type ObjectInspectorItemContents = {
  value: ObjectInspectorItemContentsValue
};

type ObjectInspectorItem = {
  contents: Array<ObjectInspectorItem> & ObjectInspectorItemContents,
  name: string,
  path: string
};

type DefaultProps = {
  onLabelClick: (
    item: ObjectInspectorItem,
    params: {
      depth: number,
      focused: boolean,
      expanded: boolean,
      setExpanded: () => any
    }
  ) => void,
  onDoubleClick: (
    item: ObjectInspectorItem,
    params: {
      depth: number,
      focused: boolean,
      expanded: boolean
    }
  ) => void,
  autoExpandDepth: number,
  getActors: () => any
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

    this.actors = null;

    const self: any = this;
    self.getChildren = this.getChildren.bind(this);
    self.renderItem = this.renderItem.bind(this);
  }

  componentWillMount() {
    // Cache of dynamically built nodes. We shouldn't need to clear
    // this out ever, since we don't ever "switch out" the object
    // being inspected.
    this.actors = this.props.getActors();
  }

  componentWillUnmount() {
    if (this.props.setActors) {
      this.props.setActors(this.actors);
    }
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
    if (nodeIsOptimizedOut(item)) {
      objectValue = dom.span({ className: "unavailable" }, "(optimized away)");
    } else if (nodeIsMissingArguments(item)) {
      objectValue = dom.span({ className: "unavailable" }, "(unavailable)");
    } else if (nodeIsFunction(item)) {
      objectValue = null;
      label = previewFunction(item);
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
        style: { marginLeft: depth * 15 },
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
          dir: "ltr",
          onClick: event => {
            event.stopPropagation();
            this.props.onLabelClick(item, {
              depth,
              focused,
              expanded,
              setExpanded
            });
          }
        },
        label
      ),
      dom.span({ className: "object-delimiter" }, objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || "")
    );
  }

  render() {
    const {
      name,
      path,
      desc,
      loadObjectProperties,
      autoExpandDepth,
      getExpanded,
      setExpanded
    } = this.props;

    let roots = this.props.roots;
    if (!roots) {
      roots = [createNode(name, path || name, desc)];
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
      getExpanded,
      setExpanded,
      renderItem: this.renderItem
    });
  }
}

ObjectInspector.displayName = "ObjectInspector";

ObjectInspector.propTypes = {
  autoExpandDepth: PropTypes.number,
  name: PropTypes.string,
  desc: PropTypes.object,
  path: PropTypes.string,
  roots: PropTypes.array,
  getObjectProperties: PropTypes.func.isRequired,
  loadObjectProperties: PropTypes.func.isRequired,
  onLabelClick: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  getExpanded: PropTypes.func,
  setExpanded: PropTypes.func,
  getActors: PropTypes.func.isRequired,
  setActors: PropTypes.func
};

ObjectInspector.defaultProps = {
  onLabelClick: () => {},
  onDoubleClick: () => {},
  autoExpandDepth: 1,
  getActors: () => ({})
};

export default ObjectInspector;
