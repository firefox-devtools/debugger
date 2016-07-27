const React = require("react");
const { DOM: dom, PropTypes } = React;

const {
  nodeHasChildren, createParentMap, addToTree,
  collapseTree, createTree
} = require("../utils/sources-tree.js");

const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const Arrow = React.createFactory(require("./utils/Arrow"));
const { Set } = require("immutable");
const debounce = require("lodash/debounce");

const ManagedTree = React.createFactory(require("./utils/ManagedTree"));
const FolderIcon = React.createFactory(require("./utils/Icons").FolderIcon);
const DomainIcon = React.createFactory(require("./utils/Icons").DomainIcon);
const FileIcon = React.createFactory(require("./utils/Icons").FileIcon);

const folder = FolderIcon({
  className: classnames(
    "folder"
  )
});

const domain = DomainIcon({
  className: classnames(
    "domain"
  )
});

const file = FileIcon({
  className: classnames(
    "file"
  )
});

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired
  },

  displayName: "SourcesTree",

  getInitialState() {
    return createTree(this.props.sources);
  },

  componentWillMount() {
    this.debouncedUpdate = debounce(this.debouncedUpdate, 20);
  },

  shouldComponentUpdate() {
    this.debouncedUpdate();
    return false;
  },

  componentWillReceiveProps(nextProps) {
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

  debouncedUpdate() {
    if (!this.isMounted()) {
      return;
    }

    this.forceUpdate();
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
      return domain;
    }

    if (!nodeHasChildren(item)) {
      return file;
    }

    return folder;
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Arrow({
      className: classnames(
        { expanded: expanded,
          hidden: !nodeHasChildren(item) }
      ),
      onClick: e => {
        e.stopPropagation();
        setExpanded(item, !expanded);
      }
    });

    const icon = this.getIcon(item, depth);

    return dom.div(
      {
        className: classnames("node", { focused }),
        style: { paddingLeft: depth * 15 + "px" },
        key: item.path,
        onClick: () => this.selectItem(item),
        onDoubleClick: e => setExpanded(item, !expanded)
      },
      dom.div(null, arrow, icon, item.name)
    );
  },

  render: function() {
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

module.exports = SourcesTree;
