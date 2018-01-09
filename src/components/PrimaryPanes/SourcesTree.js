/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

// React
import React, { Component } from "react";
import classnames from "classnames";

// Redux
import { connect } from "react-redux";
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState,
  getProjectDirectoryRoot,
  getSources
} from "../../selectors";

import { setExpandedState } from "../../actions/source-tree";
import { selectLocation } from "../../actions/sources";

// Types
import type { SourcesMap } from "../../reducers/types";
import type { SourceRecord } from "../../reducers/sources";

// Components
import ManagedTree from "../shared/ManagedTree";
import Svg from "../shared/Svg";

// Utils
import {
  nodeHasChildren,
  createParentMap,
  isDirectory,
  addToTree,
  collapseTree,
  createTree,
  getDirectories
} from "../../utils/sources-tree";
import { Set } from "immutable";
import { showMenu } from "devtools-contextmenu";
import { copyToTheClipboard } from "../../utils/clipboard";
import { throttle } from "../../utils/utils";
import { features } from "../../utils/prefs";
import { setProjectDirectoryRoot } from "../../actions/ui";

type Props = {
  selectLocation: Object => void,
  setExpandedState: any => void,
  sources: SourcesMap,
  shownSource?: string,
  selectedSource?: SourceRecord,
  debuggeeUrl: string,
  projectRoot: string,
  expanded?: any
};

type State = {
  focusedItem?: any,
  parentMap: any,
  sourceTree: any,
  projectRoot: string,
  uncollapsedTree: any,
  listItems?: any,
  highlightItems?: any
};

class SourcesTree extends Component<Props, State> {
  focusItem: Function;
  selectItem: Function;
  getPath: Function;
  getIcon: Function;
  queueUpdate: Function;
  onContextMenu: Function;
  renderItem: Function;
  mounted: boolean;

  constructor(props) {
    super(props);
    this.state = createTree(
      this.props.sources,
      this.props.debuggeeUrl,
      this.props.projectRoot
    );
    this.focusItem = this.focusItem.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.getPath = this.getPath.bind(this);
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
    if (
      this.props.projectRoot !== nextProps.projectRoot ||
      this.props.debuggeeUrl !== nextProps.debuggeeUrl
    ) {
      // Recreate tree because the sort order changed
      this.setState(
        createTree(
          nextProps.sources,
          nextProps.debuggeeUrl,
          nextProps.projectRoot
        )
      );
      return;
    }
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
      nextProps.selectedSource != this.props.selectedSource
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
      // remove all sources
      this.setState(
        createTree(
          nextProps.sources,
          nextProps.debuggeeUrl,
          nextProps.projectRoot
        )
      );
      return;
    }

    // TODO: do not run this every time a source is clicked,
    // only when a new source is added
    const next = Set(nextProps.sources.valueSeq());
    const prev = Set(this.props.sources.valueSeq());
    const newSet = next.subtract(prev);

    const uncollapsedTree = this.state.uncollapsedTree;

    // TODO: recreating the tree every time messes with the expanded
    // state of ManagedTree, because it depends on item instances
    // being the same. The result is that if a source is added at a
    // later time, all expanded state is lost.
    let sourceTree = this.state.sourceTree;
    if (newSet.size > 0) {
      for (const source of newSet) {
        addToTree(
          uncollapsedTree,
          source,
          this.props.debuggeeUrl,
          this.props.projectRoot
        );
      }
      sourceTree = collapseTree(uncollapsedTree);
    }

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
      this.props.selectLocation({ sourceId: item.contents.get("id") });
    }
  }

  getPath(item) {
    const { sources } = this.props;
    const blackBoxedPart =
      item.contents.get &&
      sources.get(item.contents.get("id")).get("isBlackBoxed")
        ? "update"
        : "";
    return `${item.path}/${item.name}/${blackBoxedPart}`;
  }

  getIcon(sources, item, depth) {
    const { debuggeeUrl } = this.props;

    if (item.path === "/Webpack") {
      return <Svg name="webpack" />;
    }

    if (item.path === "/Angular") {
      return <Svg name="angular" />;
    }

    if (depth === 0) {
      return (
        <img
          className={classnames("domain", {
            debuggee: debuggeeUrl && debuggeeUrl.includes(item.name)
          })}
        />
      );
    }

    if (!nodeHasChildren(item)) {
      const source = sources.get(item.contents.get("id"));
      if (source.get("isBlackBoxed")) {
        return <img className="blackBox" />;
      }
      return <img className="file" />;
    }

    return <img className="folder" />;
  }

  onContextMenu(event, item) {
    const copySourceUri2Label = L10N.getStr("copySourceUri2");
    const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");
    const setDirectoryRootLabel = L10N.getStr("setDirectoryRoot.label");
    const setDirectoryRootKey = L10N.getStr("setDirectoryRoot.accesskey");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    if (!isDirectory(item)) {
      const source = item.contents.get("url");
      const copySourceUri2 = {
        id: "node-menu-copy-source",
        label: copySourceUri2Label,
        accesskey: copySourceUri2Key,
        disabled: false,
        click: () => copyToTheClipboard(source)
      };

      menuOptions.push(copySourceUri2);
    }

    if (isDirectory(item) && features.root) {
      menuOptions.push({
        id: "node-set-directory-root",
        label: setDirectoryRootLabel,
        accesskey: setDirectoryRootKey,
        disabled: false,
        click: () => setProjectDirectoryRoot(item.path)
      });
    }

    showMenu(event, menuOptions);
  }

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = nodeHasChildren(item) ? (
      <img
        className={classnames("arrow", {
          expanded: expanded
        })}
        onClick={e => {
          e.stopPropagation();
          setExpanded(item, !expanded, e.altKey);
        }}
      />
    ) : (
      <i className="no-arrow" />
    );
    const { sources } = this.props;
    const icon = this.getIcon(sources, item, depth);
    let paddingDir = "paddingRight";
    if (document.body && document.body.parentElement) {
      paddingDir =
        document.body.parentElement.dir == "ltr"
          ? "paddingLeft"
          : "paddingRight";
    }

    return (
      <div
        className={classnames("node", { focused })}
        style={{ [paddingDir]: `${depth * 15 + 5}px` }}
        key={item.path}
        onClick={e => {
          this.selectItem(item);
          setExpanded(item, !expanded, e.altKey);
        }}
        onContextMenu={e => this.onContextMenu(e, item)}
      >
        {arrow}
        {icon}
        <span className="label"> {item.name} </span>
      </div>
    );
  }

  render() {
    const expanded = this.props.expanded;
    const {
      focusedItem,
      sourceTree,
      parentMap,
      listItems,
      highlightItems
    } = this.state;

    const onExpand = (item, expandedState) => {
      this.props.setExpandedState(expandedState);
    };

    const onCollapse = (item, expandedState) => {
      this.props.setExpandedState(expandedState);
    };

    const isEmpty = sourceTree.contents.length === 0;
    const treeProps = {
      key: isEmpty ? "empty" : "full",
      getParent: item => parentMap.get(item),
      getChildren: item => (nodeHasChildren(item) ? item.contents : []),
      getRoots: () => sourceTree.contents,
      getPath: this.getPath,
      itemHeight: 21,
      autoExpandDepth: expanded ? 0 : 1,
      autoExpandAll: false,
      onFocus: this.focusItem,
      listItems,
      highlightItems,
      expanded,
      onExpand,
      onCollapse,
      renderItem: this.renderItem
    };

    const tree = <ManagedTree {...treeProps} />;

    if (isEmpty) {
      return (
        <div className="no-sources-message">
          {L10N.getStr("sources.noSourcesAvailable")}
        </div>
      );
    }

    const onKeyDown = e => {
      if (e.keyCode === 13 && focusedItem) {
        this.selectItem(focusedItem);
      }
    };

    return (
      <div className="sources-list" onKeyDown={onKeyDown}>
        {tree}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    shownSource: getShownSource(state),
    selectedSource: getSelectedSource(state),
    debuggeeUrl: getDebuggeeUrl(state),
    expanded: getExpandedState(state),
    projectRoot: getProjectDirectoryRoot(state),
    sources: getSources(state)
  };
};

const actionCreators = {
  setExpandedState,
  selectLocation
};

export default connect(mapStateToProps, actionCreators)(SourcesTree);
