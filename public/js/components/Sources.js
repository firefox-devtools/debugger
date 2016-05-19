"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const { Set } = require("immutable");
const actions = require("../actions");
const { getSelectedSource, getSources } = require("../selectors");
const {
  createNode, nodeHasChildren, createParentMap, addToTree
} = require("../util/sources-tree.js");

require("./Sources.css");

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

  displayName: "SourcesTree",

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
      this.props.selectSource(item.contents.get("id"));
    }
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Arrow({
      className: classnames(
        "arrow",
        { expanded: expanded,
          hidden: !nodeHasChildren(item) }
      ),
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
      item.name
    );
  },

  render() {
    const { focusedItem, sourceTree, parentMap } = this.state;

    const tree = ManagedTree({
      getParent: item => {
        return parentMap.get(item);
      },
      getChildren: item => {
        if (nodeHasChildren(item)) {
          return item.contents;
        }
        return [];
      },
      getRoots: () => sourceTree.contents,
      getKey: (item, i) => item.path,
      itemHeight: 30,
      autoExpandDepth: 2,
      onFocus: this.focusItem,
      renderItem: this.renderItem
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
