// @flow
import { DOM as dom, PropTypes, Component, createFactory } from "react";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";

import actions from "../../actions";
import { getChromeScopes, getLoadedObjects, getPause } from "../../selectors";
import Svg from "../shared/Svg";
import "./Scopes.css";

import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

function info(text) {
  return dom.div({ className: "pane-info" }, text);
}

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

class Scopes extends Component {
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
      .filter(name => {
        // Ignore non-concrete values like getters and setters
        // for now by making sure we have a value.
        return "value" in ownProperties[name];
      })
      .map(name => {
        return createNode(name, `${parentPath}/${name}`, ownProperties[name]);
      });

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

    return dom.div(
      {
        className: classnames("node object-node", {
          focused: false,
          "not-enumerable": notEnumberable
        }),
        style: { marginLeft: depth * 15 },
        key: item.path,
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
      dom.span({ className: "object-label" }, item.name),
      dom.span({ className: "object-delimiter" }, objectValue ? ": " : ""),
      dom.span({ className: "object-value" }, objectValue || "")
    );
  }

  getObjectProperties(item) {
    this.props.loadedObjects.get(item.contents.value.objectId);
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
      return dom.div(
        { className: "pane scopes-list" },
        info(L10N.getStr("scopes.notPaused"))
      );
    }

    const roots = this.getRoots();

    return dom.div(
      { className: "pane scopes-list" },
      ManagedTree({
        itemHeight: 20,
        getParent: item => null,
        getChildren: this.getChildren,
        getRoots: () => roots,
        getKey: item => item.path,
        autoExpand: 0,
        autoExpandDepth: 1,
        autoExpandAll: false,
        disabledFocus: true,
        onExpand: this.onExpand,
        renderItem: this.renderItem
      })
    );
  }
}

Scopes.propTypes = {
  scopes: PropTypes.array,
  loadedObjects: ImPropTypes.map,
  loadObjectProperties: PropTypes.func,
  pauseInfo: PropTypes.object
};

Scopes.displayName = "Scopes";

export default connect(
  state => ({
    pauseInfo: getPause(state),
    loadedObjects: getLoadedObjects(state),
    scopes: getChromeScopes(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
