const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");

const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const { Set } = require("immutable");
const { isEnabled } = require("devtools-config");
const { getShownSource } = require("../selectors");
const {
  nodeHasChildren, createParentMap, addToTree,
  collapseTree, createTree
} = require("../utils/sources-tree.js");
const ManagedTree = React.createFactory(require("./utils/ManagedTree"));
const actions = require("../actions");
const Svg = require("./utils/Svg");
const { throttle } = require("../utils/utils");

function returnItemsStrings(url) {
  url = url.replace("http:/", "");
  url = url.replace("https:/", "");
  const itemsStrings = [];
  for (const i = 1; i < url.length; i++) {
    if (url[i] == "/") {
      itemsStrings.push(url.substring(0, i));
    }
  }
  itemsStrings.push(url);
  return itemsStrings;
}

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired,
    shownSource: PropTypes.string
  },

  displayName: "SourcesTree",

  getInitialState() {
    return createTree(this.props.sources);
  },

  queueUpdate: throttle(function() {
    if (!this.isMounted()) {
      return;
    }

    this.forceUpdate();
  }, 50),

  shouldComponentUpdate() {
    this.queueUpdate();
    return false;
  },

  componentWillReceiveProps(nextProps) {
    if (isEnabled("showSource") &&
    nextProps.shownSource != this.props.shownSource) {
      const tempList = [];
      const sourceURL = nextProps.shownSource;
      const sourceTreeList = this.state.sourceTree;
      const itemsStrings = returnItemsStrings(sourceURL);
      const processIndex = 0;

      // Determine which item(s) should be added to itemsList
      while (processIndex < itemsStrings.length) {
        const i = 0;
        const found = false;
        while (!found) {
          if (itemsStrings[processIndex] == sourceTreeList.contents[i].path) {
            tempList.push(sourceTreeList.contents[i]);
            sourceTreeList = sourceTreeList.contents[i];
            found = true;
            processIndex++;
          }
          i++;
        }
      }
      tempList.splice(0, 1);
      this.setState({ listItems: tempList });
      return;
    }

    if (nextProps.sources === this.props.sources) {
      return;
    }

    if (nextProps.sources.size === 0) {
      this.setState(createTree(nextProps.sources));
      return;
    }

    const next = Set(nextProps.sources.valueSeq());
    const prev = Set(this.props.sources.valueSeq());
    const newSet = next.subtract(prev);

    const uncollapsedTree = this.state.uncollapsedTree;
    for (let source of newSet) {
      addToTree(uncollapsedTree, source);
    }

    // TODO: recreating the tree every time messes with the expanded
    // state of ManagedTree, because it depends on item instances
    // being the same. The result is that if a source is added at a
    // later time, all expanded state is lost.
    const sourceTree = newSet.size > 0
          ? collapseTree(uncollapsedTree)
          : this.state.sourceTree;

    this.setState({ uncollapsedTree,
      sourceTree,
      parentMap: createParentMap(sourceTree) });
  },

  focusItem(item) {
    this.setState({ focusedItem: item });
  },

  selectItem(item) {
    if (!nodeHasChildren(item)) {
      this.props.selectSource(item.contents.get("id"));
    }
  },

  getIcon(item, depth) {
    if (depth === 0) {
      return Svg("domain");
    }

    if (!nodeHasChildren(item)) {
      return Svg("file");
    }

    return Svg("folder");
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Svg("arrow",
      {
        className: classnames(
          { expanded: expanded,
            hidden: !nodeHasChildren(item) }
        ),
        onClick: e => {
          e.stopPropagation();
          setExpanded(item, !expanded);
        }
      }
    );

    const icon = this.getIcon(item, depth);
    
    return dom.div(
      {
        className: classnames("node", { focused }),
        style: { paddingLeft: `${depth * 15}px` },
        key: item.path,
        onClick: () => this.selectItem(item),
        onDoubleClick: e => setExpanded(item, !expanded)
      },
      dom.div(null, arrow, icon, item.name)
    );
  },

  render: function() {
    const { focusedItem, sourceTree, parentMap } = this.state;
    const isEmpty = sourceTree.contents.length === 0;

    const tree = ManagedTree({
      key: isEmpty ? "empty" : "full",
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
      autoExpandDepth: 1,
      autoExpandAll: false,
      onFocus: this.focusItem,
      itemsList: this.state.listItems,
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

module.exports = connect(
  state => {
    const shownSource = getShownSource(state);
    return {
      shownSource
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourcesTree);
