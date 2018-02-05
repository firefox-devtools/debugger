/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

// Dependencies
import React, { Component } from "react";
import classnames from "classnames";
import { showMenu } from "devtools-contextmenu";
import { connect } from "react-redux";

// Selectors
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState,
  getProjectDirectoryRoot,
  getSources
} from "../../selectors";

// Actions
import { setExpandedState } from "../../actions/source-tree";
import { selectLocation } from "../../actions/sources";
import {
  setProjectDirectoryRoot,
  clearProjectDirectoryRoot
} from "../../actions/ui";

// Components
import ManagedTree from "../shared/ManagedTree";
import Svg from "../shared/Svg";

// Utils
import {
  createTree,
  getDirectories,
  isDirectory,
  nodeHasChildren,
  updateTree,
  getExtension
} from "../../utils/sources-tree";

import { copyToTheClipboard } from "../../utils/clipboard";
import { throttle } from "../../utils/utils";
import { features } from "../../utils/prefs";

import type { SourcesMap, SourceRecord } from "../../reducers/types";

type Props = {
  selectLocation: Object => void,
  setExpandedState: any => void,
  setProjectDirectoryRoot: string => void,
  clearProjectDirectoryRoot: void => void,
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
  sourceTree: Object,
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
    const { projectRoot, debuggeeUrl, sources } = this.props;
    this.state = createTree({
      projectRoot,
      debuggeeUrl,
      sources
    });
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
    const {
      projectRoot,
      debuggeeUrl,
      sources,
      shownSource,
      selectedSource
    } = this.props;

    const { uncollapsedTree, sourceTree } = this.state;

    if (
      projectRoot != nextProps.projectRoot ||
      debuggeeUrl != nextProps.debuggeeUrl ||
      nextProps.sources.size === 0
    ) {
      // early recreate tree because of changes
      // to project root, debugee url or lack of sources
      return this.setState(
        createTree({
          sources: nextProps.sources,
          debuggeeUrl: nextProps.debuggeeUrl,
          projectRoot: nextProps.projectRoot
        })
      );
    }
    if (nextProps.shownSource && nextProps.shownSource != shownSource) {
      const listItems = getDirectories(nextProps.shownSource, sourceTree);

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
        sourceTree
      );

      return this.setState({ highlightItems });
    }

    // NOTE: do not run this every time a source is clicked,
    // only when a new source is added
    if (nextProps.sources != this.props.sources) {
      this.setState(
        updateTree({
          newSources: nextProps.sources,
          prevSources: sources,
          debuggeeUrl,
          projectRoot,
          uncollapsedTree,
          sourceTree
        })
      );
    }
  }

  queueUpdate = throttle(function() {
    if (!this.mounted) {
      return;
    }

    this.forceUpdate();
  }, 50);

  focusItem = item => {
    this.setState({ focusedItem: item });
  };

  selectItem = item => {
    if (!nodeHasChildren(item)) {
      this.props.selectLocation({ sourceId: item.contents.get("id") });
    }
  };

  getPath = item => {
    const { sources } = this.props;
    const obj = item.contents.get && item.contents.get("id");

    let blackBoxedPart = "";

    if (
      typeof obj !== "undefined" &&
      sources.has(obj) &&
      sources.get(obj).get("isBlackBoxed")
    ) {
      blackBoxedPart = "update";
    }

    return `${item.path}/${item.name}/${blackBoxedPart}`;
  };

  getIcon = (sources, item, depth) => {
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
      const obj = item.contents.get("id");
      const source = sources.get(obj);
      if (source && source.get("isBlackBoxed")) {
        return <img className="blackBox" />;
      }
      const sourceType = {
        coffee: "coffeescript",
        js: "javascript",
        jsx: "react",
        ts: "typescript"
      }[getExtension(source)];
      return sourceType ? (
        <Svg className="source-icon" name={sourceType} />
      ) : (
        <img className="file" />
      );
    }

    return <img className="folder" />;
  };

  onContextMenu = (event, item) => {
    const copySourceUri2Label = L10N.getStr("copySourceUri2");
    const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");
    const setDirectoryRootLabel = L10N.getStr("setDirectoryRoot.label");
    const setDirectoryRootKey = L10N.getStr("setDirectoryRoot.accesskey");
    const removeDirectoryRootLabel = L10N.getStr("removeDirectoryRoot.label");

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
      const { path } = item;
      const { projectRoot } = this.props;

      if (projectRoot.endsWith(path)) {
        menuOptions.push({
          id: "node-remove-directory-root",
          label: removeDirectoryRootLabel,
          disabled: false,
          click: () => this.props.clearProjectDirectoryRoot()
        });
      } else {
        menuOptions.push({
          id: "node-set-directory-root",
          label: setDirectoryRootLabel,
          accesskey: setDirectoryRootKey,
          disabled: false,
          click: () => this.props.setProjectDirectoryRoot(path)
        });
      }
    }

    showMenu(event, menuOptions);
  };

  renderItem = (item, depth, focused, _, expanded, { setExpanded }) => {
    const arrow = nodeHasChildren(item) ? (
      <img
        className={classnames("arrow", {
          expanded: expanded
        })}
      />
    ) : (
      <i className="no-arrow" />
    );
    const { sources } = this.props;
    const icon = this.getIcon(sources, item, depth);

    return (
      <div
        className={classnames("node", { focused })}
        key={item.path}
        onClick={e => {
          e.stopPropagation();
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
  };

  render() {
    const expanded = this.props.expanded;
    const {
      focusedItem,
      highlightItems,
      listItems,
      parentMap,
      sourceTree
    } = this.state;

    const onExpand = (item, expandedState) => {
      this.props.setExpandedState(expandedState);
    };

    const onCollapse = (item, expandedState) => {
      this.props.setExpandedState(expandedState);
    };

    const isEmpty = sourceTree.contents.length === 0;
    const treeProps = {
      autoExpandAll: false,
      autoExpandDepth: expanded ? 0 : 1,
      expanded,
      getChildren: item => (nodeHasChildren(item) ? item.contents : []),
      getParent: item => parentMap.get(item),
      getPath: this.getPath,
      getRoots: () => sourceTree.contents,
      highlightItems,
      itemHeight: 21,
      key: isEmpty ? "empty" : "full",
      listItems,
      onCollapse,
      onExpand,
      onFocus: this.focusItem,
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
  selectLocation,
  setProjectDirectoryRoot,
  clearProjectDirectoryRoot
};

export default connect(mapStateToProps, actionCreators)(SourcesTree);
