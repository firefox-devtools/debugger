const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const { Set } = require("immutable");
const { isEnabled } = require("devtools-config");
const { getShownSource, getSelectedSource } = require("../selectors");
const {
  nodeHasChildren, createParentMap, addToTree,
  collapseTree, createTree, getDirectories
} = require("../utils/sources-tree.js");
const ManagedTree = React.createFactory(require("./utils/ManagedTree"));
const actions = require("../actions");
const Svg = require("./utils/Svg");
const { throttle } = require("../utils/utils");

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired,
    shownSource: PropTypes.string,
    selectedSource: ImPropTypes.map
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
      const listItems = getDirectories(
        nextProps.shownSource,
        this.state.sourceTree
      );

      this.selectItem(listItems[0]);
      return this.setState({ listItems });
    }

    if (nextProps.selectedSource != this.props.selectedSource) {
      const hLightItems = getDirectories(
        nextProps.selectedSource.get("url"),
        this.state.sourceTree
      );

      return this.setState({ hLightItems });
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
    const paddingDir = document.body.parentElement.dir == "ltr" ?
                       "paddingLeft" : "paddingRight";
    return dom.div(
      {
        className: classnames("node", { focused }),
        style: { [paddingDir]: `${depth * 15}px` },
        key: item.path,
        onClick: () => this.selectItem(item),
        onDoubleClick: e => setExpanded(item, !expanded)
      },
      dom.div(null, arrow, icon, item.name)
    );
  },

  render: function() {
    const { focusedItem, sourceTree,
      parentMap, listItems, hLightItems } = this.state;
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
      hLightItems,
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
