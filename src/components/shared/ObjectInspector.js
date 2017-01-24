const React = require("react");
const classnames = require("classnames");
const ManagedTree = React.createFactory(require("./ManagedTree"));
const Svg = require("./Svg");
const Rep = require("./Rep");
const { MODE } = require("devtools-reps");

const { DOM: dom, PropTypes } = React;

const WINDOW_PROPERTIES = Object.getOwnPropertyNames(window);

require("./ObjectInspector.css");

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

function nodeIsOptimizedOut(item) {
  return !nodeHasChildren(item) && item.contents.value.optimizedOut === true;
}

function nodeIsMissingArguments(item) {
  return !nodeHasChildren(item) &&
    item.contents.value.missingArguments === true;
}

function nodeHasProperties(item) {
  return !nodeHasChildren(item) && item.contents.value.type === "object";
}

function nodeIsPrimitive(item) {
  return !nodeHasChildren(item) && !nodeHasProperties(item);
}

function isDefault(item) {
  return WINDOW_PROPERTIES.includes(item.name);
}

function makeNodesForProperties(objProps, parentPath) {
  const { ownProperties, prototype } = objProps;

  const nodes = Object.keys(ownProperties).sort().filter(name => {
    // Ignore non-concrete values like getters and setters
    // for now by making sure we have a value.
    return "value" in ownProperties[name];
  }).map(name => {
    return createNode(name, `${parentPath}/${name}`, ownProperties[name]);
  });

  // Add the prototype if it exists and is not null
  if (prototype && prototype.type !== "null") {
    nodes.push(createNode(
      "__proto__",
      `${parentPath}/__proto__`,
      { value: prototype }
    ));
  }

  return nodes;
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
    autoExpandDepth: PropTypes.number,
    name: PropTypes.string,
    desc: PropTypes.object,
    roots: PropTypes.array,
    getObjectProperties: PropTypes.func.isRequired,
    loadObjectProperties: PropTypes.func.isRequired,
    onLabelClick: PropTypes.func
  },

  displayName: "ObjectInspector",

  getInitialState() {
    // Cache of dynamically built nodes. We shouldn't need to clear
    // this out ever, since we don't ever "switch out" the object
    // being inspected.
    this.actorCache = {};
    return {};
  },

  getDefaultProps() {
    return {
      onLabelClick: () => {},
      autoExpandDepth: 1
    };
  },

  getChildren(item) {
    const { getObjectProperties } = this.props;
    const obj = item.contents;

    // Nodes can either have children already, or be an object with
    // properties that we need to go and fetch.
    if (nodeHasChildren(item)) {
      return item.contents;
    }

    if (nodeHasProperties(item)) {
      const actor = obj.value.actor;

      // Because we are dynamically creating the tree as the user
      // expands it (not precalcuated tree structure), we cache child
      // arrays. This not only helps performance, but is necessary
      // because the expanded state depends on instances of nodes
      // being the same across renders. If we didn't do this, each
      // node would be a new instance every render.
      const key = item.path;
      if (this.actorCache[key]) {
        return this.actorCache[key];
      }

      const loadedProps = getObjectProperties(actor);
      const { ownProperties, prototype } = loadedProps || {};
      if (!ownProperties && !prototype) {
        return [];
      }

      const children = makeNodesForProperties(loadedProps, item.path);
      this.actorCache[actor] = children;
      return children;
    }

    return [];
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
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
        className: classnames("node object-node",
          {
            focused,
            "default-property": isDefault(item)
          }),
        style: { marginLeft: depth * 15 },
        onClick: e => {
          e.stopPropagation();
          setExpanded(item, !expanded);
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
          onClick: event => {
            event.stopPropagation();
            this.props.onLabelClick(item, { depth, focused, expanded });
          }
        },
        item.name
      ),
      dom.span({ className: "object-delimiter" },
               objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || "")
    );
  },

  render() {
    const { name, desc, loadObjectProperties,
            autoExpandDepth } = this.props;

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
});

module.exports = ObjectInspector;
