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
  updateTree
} from "../../utils/sources-tree";

import { getRawSourceURL, getSourceClassnames } from "../../utils/source";
import { copyToTheClipboard } from "../../utils/clipboard";
import { features } from "../../utils/prefs";

import type { SourcesMap } from "../../reducers/types";
import type { SourceRecord } from "../../types";

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
    const { debuggeeUrl, sources, projectRoot } = this.props;

    this.state = createTree({
      projectRoot,
      debuggeeUrl,
      sources
    });
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
        getRawSourceURL(nextProps.selectedSource.get("url")),
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
    const { debuggeeUrl, projectRoot } = this.props;

    if (item.path === "webpack://") {
      return <Svg name="webpack" />;
    } else if (item.path === "ng://") {
      return <Svg name="angular" />;
    } else if (item.path === "moz-extension://") {
      return <img className="extension" />;
    }

    if (depth === 0 && projectRoot === "") {
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
      return (
        <img
          className={classnames(
            getSourceClassnames(source.toJS()),
            "source-icon"
          )}
        />
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
          this.focusItem(item);

          if (isDirectory(item)) {
            setExpanded(item, !!expanded, e.altKey);
          } else {
            this.selectItem(item);
          }
        }}
        onContextMenu={e => this.onContextMenu(e, item)}
      >
        {arrow}
        {icon}
        <span className="label"> {this.renderItemName(item.name)} </span>
      </div>
    );
  };

  renderItemName(name) {
    const hosts = {
      "ng://": "Angular",
      "webpack://": "Webpack",
      "moz-extension://": L10N.getStr("extensionsText")
    };

    return hosts[name] || name;
  }

  renderEmptyElement(message) {
    return <div className="no-sources-message">{message}</div>;
  }

  render() {
    const { expanded, projectRoot } = this.props;
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

    const isCustomRoot = projectRoot !== "";
    let roots = () => sourceTree.contents;

    let clearProjectRootButton = null;

    // The "sourceTree.contents[0]" check ensures that there are contents
    // A custom root with no existing sources will be ignored
    if (isCustomRoot) {
      let rootLabel = projectRoot.split("/").pop();
      if (sourceTree.contents[0]) {
        rootLabel = sourceTree.contents[0].name;
        roots = () => sourceTree.contents[0].contents;
      }

      clearProjectRootButton = (
        <button
          className="sources-clear-root"
          onClick={() => this.props.clearProjectDirectoryRoot()}
          title={L10N.getStr("removeDirectoryRoot.label")}
        >
          <Svg name="home" />
          <Svg name="breadcrumb" class />
          <span className="sources-clear-root-label">{rootLabel}</span>
        </button>
      );
    }

    if (isEmpty && !isCustomRoot) {
      return this.renderEmptyElement(L10N.getStr("sources.noSourcesAvailable"));
    }

    const treeProps = {
      autoExpandAll: false,
      autoExpandDepth: expanded ? 0 : 1,
      expanded,
      getChildren: item => (nodeHasChildren(item) ? item.contents : []),
      getParent: item => parentMap.get(item),
      getPath: this.getPath,
      getRoots: roots,
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

    const onKeyDown = e => {
      if (e.keyCode === 13 && focusedItem) {
        this.selectItem(focusedItem);
      }
    };

    return (
      <div
        className={classnames("sources-pane", {
          "sources-list-custom-root": isCustomRoot
        })}
      >
        {isCustomRoot ? (
          <div className="sources-clear-root-container">
            {clearProjectRootButton}
          </div>
        ) : null}
        {isEmpty ? (
          this.renderEmptyElement(L10N.getStr("sources.noSourcesAvailableRoot"))
        ) : (
          <div className="sources-list" onKeyDown={onKeyDown}>
            {tree}
          </div>
        )}
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
