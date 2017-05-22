// @flow

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DOM as dom, PropTypes, Component, createFactory } from "react";
import classnames from "classnames";
import ImPropTypes from "react-immutable-proptypes";
import { Set } from "immutable";
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl
} from "../selectors";

import {
  nodeHasChildren,
  createParentMap,
  isDirectory,
  addToTree,
  collapseTree,
  createTree,
  getDirectories
} from "../utils/sources-tree.js";

import _ManagedTree from "./shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import actions from "../actions";
import Svg from "./shared/Svg";
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../utils/clipboard";
import { throttle } from "../utils/utils";

type CreateTree = {
  focusedItem?: any,
  parentMap: any,
  sourceTree: any,
  uncollapsedTree: any,
  listItems?: any,
  highlightItems?: any
};

class SourcesTree extends Component {
  state: CreateTree;
  focusItem: Function;
  selectItem: Function;
  getIcon: Function;
  queueUpdate: Function;
  onContextMenu: Function;
  renderItem: Function;
  mounted: boolean;

  constructor(props) {
    super(props);
    this.state = createTree(this.props.sources, this.props.debuggeeUrl);

    this.focusItem = this.focusItem.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.getIcon = this.getIcon.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.renderItem = this.renderItem.bind(this);

    this.queueUpdate = throttle(function() {
      if (!this.mounted) {
        return;
      }

      this.forceUpdate();
    }, 50);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnMount() {
    this.mounted = false;
  }

  shouldComponentUpdate() {
    this.queueUpdate();
    return false;
  }

  componentWillReceiveProps(nextProps) {
    const { selectedSource } = this.props;
    if (
      nextProps.shownSource &&
      nextProps.shownSource != this.props.shownSource
    ) {
      const listItems = getDirectories(
        nextProps.shownSource,
        this.state.sourceTree
      );

      if (listItems && listItems[0]) {
        this.selectItem(listItems[0]);
      }

      return this.setState({ listItems });
    }

    if (
      nextProps.selectedSource &&
      nextProps.selectedSource != selectedSource
    ) {
      const highlightItems = getDirectories(
        nextProps.selectedSource.get("url"),
        this.state.sourceTree
      );

      return this.setState({ highlightItems });
    }

    if (nextProps.sources === this.props.sources) {
      return;
    }

    if (nextProps.sources.size === 0) {
      this.setState(createTree(nextProps.sources, this.props.debuggeeUrl));
      return;
    }

    const next = Set(nextProps.sources.valueSeq());
    const prev = Set(this.props.sources.valueSeq());
    const newSet = next.subtract(prev);

    const uncollapsedTree = this.state.uncollapsedTree;
    for (let source of newSet) {
      addToTree(uncollapsedTree, source, this.props.debuggeeUrl);
    }

    // TODO: recreating the tree every time messes with the expanded
    // state of ManagedTree, because it depends on item instances
    // being the same. The result is that if a source is added at a
    // later time, all expanded state is lost.
    const sourceTree = newSet.size > 0
      ? collapseTree(uncollapsedTree)
      : this.state.sourceTree;

    this.setState({
      uncollapsedTree,
      sourceTree,
      parentMap: createParentMap(sourceTree)
    });
  }

  focusItem(item) {
    this.setState({ focusedItem: item });
  }

  selectItem(item) {
    if (!nodeHasChildren(item)) {
      this.props.selectSource(item.contents.get("id"));
    }
  }

  getIcon(item, depth) {
    if (depth === 0) {
      return Svg("domain");
    }

    if (!nodeHasChildren(item)) {
      return Svg("file");
    }

    return Svg("folder");
  }

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
  }

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Svg("arrow", {
      className: classnames({
        expanded: expanded,
        hidden: !nodeHasChildren(item)
      }),
      onClick: e => {
        e.stopPropagation();
        setExpanded(item, !expanded);
      }
    });

    const icon = this.getIcon(item, depth);
    let paddingDir = "paddingRight";
    if (document.body && document.body.parentElement) {
      paddingDir = document.body.parentElement.dir == "ltr"
        ? "paddingLeft"
        : "paddingRight";
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
        onContextMenu: e => this.onContextMenu(e, item)
      },
      dom.div(null, arrow, icon, item.name)
    );
  }

  render() {
    const { isHidden } = this.props;
    const {
      focusedItem,
      sourceTree,
      parentMap,
      listItems,
      highlightItems
    } = this.state;

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

    const noSourcesMessage = dom.div(
      {
        className: "no-sources-message"
      },
      L10N.getStr("sources.noSourcesAvailable")
    );

    if (isEmpty) {
      return noSourcesMessage;
    }
    return dom.div(
      {
        className: classnames("sources-list", { hidden: isHidden }),
        onKeyDown: e => {
          if (e.keyCode === 13 && focusedItem) {
            this.selectItem(focusedItem);
          }
        }
      },
      tree
    );
  }
}

SourcesTree.propTypes = {
  isHidden: PropTypes.bool,
  sources: ImPropTypes.map.isRequired,
  selectSource: PropTypes.func.isRequired,
  shownSource: PropTypes.string,
  selectedSource: ImPropTypes.map,
  debuggeeUrl: PropTypes.string.isRequired
};

SourcesTree.displayName = "SourcesTree";

export default connect(
  state => {
    return {
      shownSource: getShownSource(state),
      selectedSource: getSelectedSource(state),
      debuggeeUrl: getDebuggeeUrl(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourcesTree);
