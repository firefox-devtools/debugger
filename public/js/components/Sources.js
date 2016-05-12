"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const Isvg = React.createFactory(require("react-inlinesvg"));
const actions = require("../actions");
const { getSelectedSource, getSourceTree, pathHasChildren, pathContents } = require("../selectors");
const { DOM: dom } = React;

require("./Sources.css");

let SourcesTree = React.createClass({
  getInitialState() {
    return { focusedItem: null };
  },

  focusItem(item) {
    this.setState({ focusedItem: item });
  },

  selectItem(item) {
    if(!pathHasChildren(item)) {
      this.props.selectSource(item[1].toJS());
    }
  },

  render() {
    const { sourceTree } = this.props;
    const { focusedItem } = this.state;

    const tree = ManagedTree({
      getParent: item => {
        return sourceTree.parentMap.get(item);
      },
      getChildren: item => {
        if(pathHasChildren(item)) {
          return pathContents(item).toArray();
        }
        return [];
      },
      getRoots: () => sourceTree.tree.get(1).toArray(),
      getKey: (item, i) => i,
      itemHeight: 30,
      autoExpandDepth: 3,
      onFocus: this.focusItem,
      renderItem: (item, depth, focused, arrow, expanded, { setExpanded }) => {
        return dom.div(
          { className: focused ? 'focused' : '',
            style: { marginLeft: depth * 20 + "px",
                     height: 20 },
            onClick: () => this.selectItem(item),
            onDoubleClick: e => {
              setExpanded(item, !expanded);
            }},
          dom.img({ className: classnames("arrow",
                                          { expanded: expanded,
                                            hidden: !pathHasChildren(item) }),
                    onClick: e => { e.stopPropagation(); setExpanded(item, !expanded) },
                    src: "images/arrow.svg" }),
          item.get(0)
        );
      }
    });

    return dom.div({
      onKeyDown: e => {
        if (e.keyCode === 13 && focusedItem) {
          this.selectItem(focusedItem);
        }
      }
    }, tree);
  }
});
SourcesTree = React.createFactory(SourcesTree);

function Sources({ sourceTree, selectSource, selectedSource }) {
  return dom.div(
    { className: "sources-panel" },
    dom.div({ className: "sources-header" }),
    SourcesTree({ sourceTree, selectSource })
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state),
              sourceTree: getSourceTree(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
