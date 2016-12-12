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
  const itemsStrings = [];
  // Handle files in "extensions://"
  if (url.indexOf("extensions::") == 0) {
    itemsStrings.push("/extensions://");
    // Get the string after "extensions::"
    itemsStrings.push(`/extensions:///:${url.substring(12)}`);
    itemsStrings.push(url);
  } else {
    url = url.replace(/http(s)?:\//, "");
    for (const i = 1; i < url.length; i++) {
      if (url[i] == "/" || url[i] == "?") {
        itemsStrings.push(url.substring(0, i));
      }
    }
    itemsStrings.push(url);
  }
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

  getExpandedItems(nextProps) {
    const tempList = [];
    const sourceURL = nextProps.shownSource;
    const sourceTreeList = this.state.sourceTree;
    const itemsStrings = returnItemsStrings(sourceURL);
    const itemIndex = 0;

    // Determine which item(s) should be added to itemsList
    while (itemIndex < itemsStrings.length) {
      const i = 0;
      const found = false;
      while (!found) {
        const currItem = sourceTreeList.contents[i];
        if (!currItem) {
          // Handle the case where we've reached the leaf and the file
          found = true;
          itemIndex++;
        } else {
          // 'https//'' in currItem.path will break the code
          const currItemPath = currItem.path.replace(/http(s)?:\//, "");
          if (itemsStrings[itemIndex] == currItemPath) {
            tempList.push(currItem);
            sourceTreeList = currItem;
            found = true;
            itemIndex++;
          } else if (currItem.path.indexOf(itemsStrings[itemIndex]) != -1) {
            // Handle the case where a folder's name contains '/'
            found = true;
            itemIndex++;
          }
        }
        i++;
      }
    }

    // Has not reached the leaf node. Keep processing until hits the leaf.
    if (tempList[tempList.length - 1].contents[0]) {
      const lastItem = tempList[tempList.length - 1].contents[0];
      tempList.push(lastItem);
      while (lastItem.contents[0]) {
        lastItem = tempList[tempList.length - 1].contents[0];
        tempList.push(lastItem);
      }
    }
    this.setState({ listItems: tempList });
  },

  componentWillReceiveProps(nextProps) {
    if (isEnabled("showSource") &&
    nextProps.shownSource != this.props.shownSource) {
      this.getExpandedItems(nextProps);
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
