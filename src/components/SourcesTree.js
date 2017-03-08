// @flow
const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const { Set } = require("immutable");
const { getShownSource, getSelectedSource } = require("../selectors");
const {
  nodeHasChildren, createParentMap, isDirectory, addToTree,
  collapseTree, createTree, getDirectories
} = require("../utils/sources-tree.js");
const ManagedTree = React.createFactory(require("./shared/ManagedTree"));
const actions = require("../actions");
const Svg = require("./shared/Svg");
const { showMenu } = require("./shared/menu");
const { copyToTheClipboard } = require("../utils/clipboard");
const { throttle } = require("../utils/utils");

type CreateTree = {
  focusedItem?: any,
  parentMap: any,
  sourceTree: any,
  uncollapsedTree: any,
  listItems?: any,
  highlightItems?: any
};

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired,
    shownSource: PropTypes.string,
    selectedSource: ImPropTypes.map
  },

  displayName: "SourcesTree",

  getInitialState(): CreateTree {
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
    const { selectedSource } = this.props;
    if (nextProps.shownSource &&
        nextProps.shownSource != this.props.shownSource) {
      const listItems = getDirectories(
        nextProps.shownSource,
        this.state.sourceTree
      );

      if (listItems && listItems[0]) {
        this.selectItem(listItems[0]);
      }

      return this.setState({ listItems });
    }

    if (nextProps.selectedSource &&
        nextProps.selectedSource != selectedSource) {
      const highlightItems = getDirectories(
        nextProps.selectedSource.get("url"),
        this.state.sourceTree
      );

      return this.setState({ highlightItems });
    }

    if (nextProps.sources === this.props.sources) {
      return;
    }

    if (nextProps.sources && nextProps.sources.size === 0) {
      this.setState(createTree(nextProps.sources));
      return;
    }

    const next = !nextProps.sources ?
      Set() : Set(nextProps.sources.valueSeq());
    const prev = !this.props.sources ?
      Set() : Set(this.props.sources.valueSeq());
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

  onContextMenu(event, item) {
    const copySourceUrlLabel = L10N.getStr("copySourceUrl");
    const copySourceUrlKey = L10N.getStr("copySourceUrl.accesskey");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    if (!isDirectory(item)) {
      const source = item.contents.get("url");
      const copySourceUrl = {
        id: "node-menu-copy-source",
        label: copySourceUrlLabel,
        accesskey: copySourceUrlKey,
        disabled: false,
        click: () => copyToTheClipboard(source)
      };

      menuOptions.push(copySourceUrl);
    }

    showMenu(event, menuOptions);
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Svg(
      "arrow",
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
    let paddingDir = "paddingRight";
    if (document.body && document.body.parentElement) {
      paddingDir = document.body.parentElement.dir == "ltr" ?
                         "paddingLeft" : "paddingRight";
    }

    return dom.div(
      {
        className: classnames("node", { focused }),
        style: { [paddingDir]: `${depth * 15}px` },
        key: item.path,
        onClick: () => {
          this.selectItem(item);
          setExpanded(item, !expanded);
        },
        onContextMenu: (e) => this.onContextMenu(e, item)
      },
      dom.div(null, arrow, icon, item.name)
    );
  },

  render: function() {
    const { focusedItem, sourceTree,
      parentMap, listItems, highlightItems } = this.state;
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
      itemHeight: 18,
      autoExpandDepth: 1,
      autoExpandAll: false,
      onFocus: this.focusItem,
      listItems,
      highlightItems,
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
    return {
      shownSource: getShownSource(state),
      selectedSource: getSelectedSource(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourcesTree);
