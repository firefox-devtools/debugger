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
import { setProjectDirectoryRoot } from "../../actions/ui";

// Types
import type { Props, State } from "../../utils/sources-tree/types";

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

import { copyToTheClipboard } from "../../utils/clipboard";
import { throttle } from "../../utils/utils";
import { features } from "../../utils/prefs";

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

    this.state = createTree(this.props);

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
      this.props.projectRoot != nextProps.projectRoot ||
      this.props.debuggeeUrl != nextProps.debuggeeUrl ||
      nextProps.sources.size === 0
    ) {
      // early recreate tree because of changes
      return this.setState(createTree(nextProps));
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

    if (nextProps.sources == this.props.sources) {
      return;
    }

    // TODO: do not run this every time a source is clicked,
    // only when a new source is added

    // TODO: recreating the tree every time messes with the expanded
    // state of ManagedTree, because it depends on item instances
    // being the same. The result is that if a source is added at a
    // later time, all expanded state is lost.
    this.setState(updateTree(nextProps, this.props, this.state));
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
  selectLocation
};

export default connect(mapStateToProps, actionCreators)(SourcesTree);
