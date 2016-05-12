"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const { Set } = require("immutable");
const actions = require("../actions");
const { getSelectedSource, getSources } = require("../selectors");
const { DOM: dom, PropTypes } = React;

require("./Sources.css");

function nodeHasChildren(item) {
  return item[2] instanceof Array;
}

function nodeName(item) {
  return item[0];
}

function nodePath(item) {
  return item[1];
}

function nodeContents(item) {
  return item[2];
}

function setNodeContents(item, contents) {
  item[2] = contents;
}

function createNode(name, path, contents) {
  return [name, path, contents];
}

function createParentMap(tree) {
  const map = new WeakMap();

  function _traverse(subtree) {
    if (nodeHasChildren(subtree)) {
      for (let child of nodeContents(subtree)) {
        map.set(child, subtree);
        _traverse(child);
      }
    }
  }

  // Don't link each top-level path to the "root" node because the
  // user never sees the root
  nodeContents(tree).forEach(_traverse);
  return map;
}

function getURL(source) {
  try {
    if (!source.get("url")) {
      return null;
    }

    const url = new URL(source.get("url"));

    // Filter out things like `javascript:<code>` URLs for now.
    // Whitelist the protocols because there may be several strange
    // ones.
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch (e) {
    // If there is a parse error (which may happen with various
    // internal script that don't have a correct URL), just ignore it.
    return null;
  }
}

function addToTree(tree, source) {
  const url = getURL(source);
  if (!url) {
    return;
  }

  const parts = url.pathname.split("/").filter(p => p !== "");
  const isDir = (parts.length === 0 ||
                 parts[parts.length - 1].indexOf(".") === -1);
  parts.unshift(url.host);

  let path = "";
  let subtree = tree;

  for (let part of parts) {
    const subpaths = nodeContents(subtree);
    // We want to sort alphabetically, so find the index where we
    // should insert this part.
    let idx = subpaths.findIndex(subpath => {
      return nodeName(subpath).localeCompare(part) >= 0;
    });

    // The node always acts like one with children, but the code below
    // this loop will set the contents of the final node to the source
    // object.
    const pathItem = createNode(part, path + "/" + part, []);

    if (idx >= 0 && nodeName(subpaths[idx]) === part) {
      subtree = subpaths[idx];
    } else {
      // Add a new one
      const where = idx === -1 ? subpaths.length : idx;
      subpaths.splice(where, 0, pathItem);
      subtree = subpaths[where];
    }

    // Keep track of the subpaths so we can tag each node with them.
    path = path + "/" + part;
  }

  // Store the soure in the final created node.
  if (isDir) {
    setNodeContents(
      subtree,
      [createNode("(index)", source.get("url"), source)]
    );
  } else {
    setNodeContents(subtree, source);
  }
}

// This is inline because it's much faster. We need to revisit how we
// load SVGs, at least for components that render them several times.
let Arrow = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M8 13.4c-.5 0-.9-.2-1.2-.6L.4 5.2C0 4.7-.1 4.3.2 3.7S1 3 1.6 3h12.8c.6 0 1.2.1 1.4.7.3.6.2 1.1-.2 1.6l-6.4 7.6c-.3.4-.7.5-1.2.5z" }) // eslint-disable-line max-len
    )
  );
};
Arrow = React.createFactory(Arrow);

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired
  },

  makeInitialState(props) {
    const tree = createNode("root", "", []);
    for (let source of props.sources.valueSeq()) {
      addToTree(tree, source);
    }

    return { sourceTree: tree,
             parentMap: createParentMap(tree),
             focusedItem: null };
  },

  getInitialState() {
    return this.makeInitialState(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.sources !== this.props.sources) {
      if (nextProps.sources.size === 0) {
        this.setState(this.makeInitialState(nextProps));
        return;
      }

      const next = Set(nextProps.sources.valueSeq());
      const prev = Set(this.props.sources.valueSeq());
      const newSet = next.subtract(prev);

      const tree = this.state.sourceTree;
      for (let source of newSet) {
        addToTree(tree, source);
      }

      this.setState({ sourceTree: tree,
                      parentMap: createParentMap(tree) });
    }
  },

  focusItem(item) {
    this.setState({ focusedItem: item });
  },

  selectItem(item) {
    if (!nodeHasChildren(item)) {
      this.props.selectSource(nodeContents(item).toJS());
    }
  },

  render() {
    const { focusedItem, sourceTree, parentMap } = this.state;

    const tree = ManagedTree({
      getParent: item => {
        return parentMap.get(item);
      },
      getChildren: item => {
        if (nodeHasChildren(item)) {
          return nodeContents(item);
        }
        return [];
      },
      getRoots: () => nodeContents(sourceTree),
      getKey: (item, i) => nodePath(item),
      itemHeight: 30,
      autoExpandDepth: 2,
      onFocus: this.focusItem,
      renderItem: (item, depth, focused, _, expanded, { setExpanded }) => {
        const arrow = Arrow({
          className: classnames("arrow",
                                { expanded: expanded,
                                  hidden: !nodeHasChildren(item) }),
          onClick: e => {
            e.stopPropagation();
            setExpanded(item, !expanded);
          }
        });

        return dom.div(
          { className: classnames("node", { focused }),
            style: { marginLeft: depth * 15 + "px" },
            onClick: () => this.selectItem(item),
            onDoubleClick: e => {
              setExpanded(item, !expanded);
            } },
          arrow,
          nodeName(item)
        );
      }
    });

    return dom.div({
      className: "sources-list",
      onKeyDown: e => {
        if (e.keyCode === 13 && focusedItem) {
          this.selectItem(focusedItem);
        }
      }
    }, tree);
  }
});
SourcesTree = React.createFactory(SourcesTree);

function Sources({ sources, selectSource, selectedSource }) {
  return dom.div(
    { className: "sources-panel" },
    dom.div({ className: "sources-header" }),
    SourcesTree({ sources, selectSource })
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state),
              sources: getSources(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
