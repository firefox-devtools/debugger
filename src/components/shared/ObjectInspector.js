// @flow
const React = require("react");
const classnames = require("classnames");
const ManagedTree = React.createFactory(require("./ManagedTree"));
const Svg = require("./Svg");
const Rep = require("./Rep");
const { MODE } = require("devtools-reps");

const {
  nodeIsOptimizedOut,
  nodeIsMissingArguments,
  nodeHasProperties,
  nodeIsPrimitive,
  isDefault,
  getChildren,
  createNode,
} = require("../../utils/object-inspector");

const { DOM: dom, PropTypes } = React;

export type ObjectInspectorItemContentsValue = {
  actor: string,
  class: string,
  displayClass: string,
  extensible: boolean,
  frozen: boolean,
  ownPropertyLength: number,
  preview: Object,
  sealed: boolean,
  type: string,
};

type ObjectInspectorItemContents = {
  value: ObjectInspectorItemContentsValue,
};

type ObjectInspectorItem = {
  contents: Array<ObjectInspectorItem> & ObjectInspectorItemContents,
  name: string,
  path: string,
};

type DefaultProps = {
  onLabelClick: any,
  onDoubleClick: any,
  autoExpandDepth: number,
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

const ObjectInspector = React.createClass({
  propTypes: {
    autoExpandDepth: PropTypes.number,
    name: PropTypes.string,
    desc: PropTypes.object,
    roots: PropTypes.array,
    getObjectProperties: PropTypes.func.isRequired,
    loadObjectProperties: PropTypes.func.isRequired,
    onLabelClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    getExpanded: PropTypes.func,
    setExpanded: PropTypes.func,
    getActors: PropTypes.func.isRequired,
    setActors: PropTypes.func,
  },

  actors: (null: any),

  displayName: "ObjectInspector",

  getInitialState() {
    return {};
  },

  getDefaultProps(): DefaultProps {
    return {
      onLabelClick: () => {},
      onDoubleClick: () => {},
      autoExpandDepth: 1,
      getActors: () => ({}),
    };
  },

  componentWillMount() {
    // Cache of dynamically built nodes. We shouldn't need to clear
    // this out ever, since we don't ever "switch out" the object
    // being inspected.
    this.actors = this.props.getActors();
  },

  componentWillUnmount() {
    if (this.props.setActors) {
      this.props.setActors(this.actors);
    }
  },

  getChildren(item: ObjectInspectorItem) {
    const { getObjectProperties } = this.props;
    const { actors } = this;

    return getChildren({
      getObjectProperties,
      actors,
      item,
    });
  },

  renderItem(
    item: ObjectInspectorItem,
    depth: number,
    focused: boolean,
    _: Object,
    expanded: boolean,
    { setExpanded }: () => any,
  ) {
    let objectValue;
    if (nodeIsOptimizedOut(item)) {
      objectValue = dom.span({ className: "unavailable" }, "(optimized away)");
    } else if (nodeIsMissingArguments(item)) {
      objectValue = dom.span({ className: "unavailable" }, "(unavailable)");
    } else if (nodeHasProperties(item) || nodeIsPrimitive(item)) {
      const object = item.contents.value;
      objectValue = Rep({ object, mode: MODE.TINY });
    }

    return dom.div(
      {
        className: classnames("node object-node", {
          focused,
          "default-property": isDefault(item),
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
            expanded,
          });
        },
      },
      Svg("arrow", {
        className: classnames({
          expanded: expanded,
          hidden: nodeIsPrimitive(item),
        }),
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
              setExpanded,
            });
          },
        },
        item.name,
      ),
      dom.span({ className: "object-delimiter" }, objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || ""),
    );
  },

  render() {
    const {
      name,
      desc,
      loadObjectProperties,
      autoExpandDepth,
      getExpanded,
      setExpanded,
    } = this.props;

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
      getExpanded,
      setExpanded,
      renderItem: this.renderItem,
    });
  },
});

module.exports = ObjectInspector;
