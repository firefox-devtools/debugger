const React = require("react");
const classnames = require("classnames");
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const Arrow = React.createFactory(require("./util/Arrow"));
const Rep = require("./Rep");
const { DOM: dom, PropTypes } = React;

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

function nodeHasChildren(item) {
  return Array.isArray(item.contents);
}

function nodeHasProperties(item) {
  return !nodeHasChildren(item) && item.contents.value.type === "object";
}

function nodeIsPrimitive(item) {
  return !nodeHasChildren(item) && !nodeHasProperties(item);
}

function createNode(name, path, contents) {
  // The path is important to uniquely identify the item in the entire
  // tree. This helps debugging & optimizes React's rendering of large
  // lists. The path will be separated by property name,
  // i.e. `{ foo: { bar: { baz: 5 }}}` will have a path of `foo/bar/baz`
  // for the inner object.
  return { name, path, contents };
}

const ObjectInspector = React.createClass({
  propTypes: {
    name: PropTypes.string,
    desc: PropTypes.object,
    roots: PropTypes.array,
    getObjectProperties: PropTypes.func.isRequired,
    loadObjectProperties: PropTypes.func.isRequired
  },

  displayName: "ObjectInspector",

  getInitialState() {
    // Cache of dynamically built nodes. We shouldn't need to clear
    // this out ever, since we don't ever "switch out" the object
    // being inspected.
    this.actorCache = {};
    return {};
  },

  makeNodesForProperties(objProps, parentPath) {
    const { ownProperties, prototype } = objProps;

    const nodes = Object.keys(ownProperties).filter(name => {
      // Ignore non-concrete values like getters and setters
      // for now by making sure we have a value.
      return "value" in ownProperties[name];
    }).map(name => {
      return createNode(name, parentPath + "/" + name, ownProperties[name]);
    });

    // Add the prototype if it exists and is not null
    if (prototype && prototype.type !== "null") {
      nodes.push(createNode(
        "__proto__",
        parentPath + "/__proto__",
        { value: prototype }
      ));
    }

    return nodes;
  },

  getChildren(item) {
    const { getObjectProperties } = this.props;
    const obj = item.contents;

    // Nodes can either have children already, or be an object with
    // properties that we need to go and fetch.
    if (nodeHasChildren(item)) {
      return item.contents;
    } else if (nodeHasProperties(item)) {
      const actor = obj.value.actor;

      // Because we are dynamically creating the tree as the user
      // expands it (not precalcuated tree structure), we cache child
      // arrays. This not only helps performance, but is necessary
      // because the expanded state depends on instances of nodes
      // being the same across renders. If we didn't do this, each
      // node would be a new instance every render.
      if (this.actorCache[actor]) {
        return this.actorCache[actor];
      }

      const loadedProps = getObjectProperties(actor);
      if (loadedProps) {
        const children = this.makeNodesForProperties(loadedProps, item.path);
        this.actorCache[actor] = children;
        return children;
      }
      return [];
    }
    return [];
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    let objectValue;
    if (nodeHasProperties(item) || nodeIsPrimitive(item)) {
      const object = item.contents.value;
      objectValue = Rep({ object });
    }

    return dom.div(
      { className: classnames("node", { focused }),
        style: { marginLeft: depth * 15 },
        onClick: e => {
          e.stopPropagation();
          setExpanded(item, !expanded);
        }
      },
      Arrow({
        className: classnames({
          expanded: expanded,
          hidden: nodeIsPrimitive(item)
        })
      }),
      dom.span({ className: "object-label" }, item.name),
      dom.span({ className: "object-delimiter" },
               objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || "")
    );
  },

  render() {
    const { name, desc, loadObjectProperties } = this.props;

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
      disabledFocus: true,
      onExpand: item => {
        if (nodeHasProperties(item)) {
          loadObjectProperties(item.contents.value);
        }
      },

      renderItem: this.renderItem
    });
  }
});

module.exports = ObjectInspector;
