/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

// Dependencies
import React from "React";
import classnames from "classnames";
import { showMenu } from "devtools-contextmenu";
import { connect } from "react-redux";
import SourceIcon from "../shared/SourceIcon";

// Selectors
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState,
  getProjectDirectoryRoot,
  getRelativeSources
} from "../../selectors";

// Actions
import { setExpandedState } from "../../actions/source-tree";
import { selectSource } from "../../actions/sources";
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
  getSourceRecordFromNode,
  nodeHasChildren,
  updateTree
} from "../../utils/sources-tree";

import { getRawSourceURL } from "../../utils/source";
import { copyToTheClipboard } from "../../utils/clipboard";
import { features } from "../../utils/prefs";

import type { SourcesMap } from "../../reducers/types";
import type { SourceRecord } from "../../types";
import type { Node } from "../../utils/sources-tree/types";

type Props = {
  selectSource: string => void,
  setExpandedState: (Set<string>) => void,
  setProjectDirectoryRoot: string => void,
  clearProjectDirectoryRoot: void => void,
  sources: SourcesMap,
  shownSource?: string,
  selectedSource?: SourceRecord,
  debuggeeUrl: string,
  projectRoot: string,
  expanded?: boolean
};

type State = {
  focusedItem: ?Node,
  parentMap: WeakMap<Node, Node>,
  sourceTree: Node,
  uncollapsedTree: Node,
  listItems?: Node[],
  highlightItems?: Node[]
};

type SetExpanded = (item: Node, expanded: boolean, altKey: boolean) => void;

class SourcesTree extends React.Component<Props, State> {
  mounted: boolean;

  constructor(props: Props) {
    super(props);
    const { debuggeeUrl, sources, projectRoot } = this.props;

    this.state = createTree({
      projectRoot,
      debuggeeUrl,
      sources
    });
  }

  componentWillReceiveProps(nextProps: Props) {
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

  focusItem = (item: Node) => {
    this.setState({ focusedItem: item });
  };

  selectItem = (item: Node) => {
    if (
      !isDirectory(item) &&
      // This second check isn't strictly necessary, but it ensures that Flow
      // knows that we are doing the correct thing.
      !Array.isArray(item.contents)
    ) {
      this.props.selectSource(item.contents.id);
    }
  };

  // NOTE: we get the source from sources because item.contents is cached
  getSource(item: Node): ?SourceRecord {
    const source = getSourceRecordFromNode(item);
    if (source) {
      return this.props.sources.get(source.id);
    }
    return null;
  }

  getPath = (item: Node): string => {
    const path = `${item.path}/${item.name}`;

    if (isDirectory(item)) {
      return path;
    }

    const source = this.getSource(item);
    const blackBoxedPart = source && source.isBlackBoxed ? ":blackboxed" : "";

    return `${path}${blackBoxedPart}`;
  };

  getIcon = (sources: SourcesMap, item: Node, depth: number): React.Node => {
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

    if (isDirectory(item)) {
      return <img className="folder" />;
    }

    const source = this.getSource(item);
    return <SourceIcon source={source} />;
  };

  onContextMenu = (event: Event, item: Node) => {
    const copySourceUri2Label = L10N.getStr("copySourceUri2");
    const copySourceUri2Key = L10N.getStr("copySourceUri2.accesskey");
    const setDirectoryRootLabel = L10N.getStr("setDirectoryRoot.label");
    const setDirectoryRootKey = L10N.getStr("setDirectoryRoot.accesskey");
    const removeDirectoryRootLabel = L10N.getStr("removeDirectoryRoot.label");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    if (!isDirectory(item)) {
      // Flow requires some extra handling to ensure the value of contents.
      const { contents } = item;
      if (!Array.isArray(contents)) {
        const copySourceUri2 = {
          id: "node-menu-copy-source",
          label: copySourceUri2Label,
          accesskey: copySourceUri2Key,
          disabled: false,
          click: () => copyToTheClipboard(contents.url)
        };

        menuOptions.push(copySourceUri2);
      }
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

  onExpand = (item: Node, expandedState: Set<string>) => {
    this.props.setExpandedState(expandedState);
  };

  onCollapse = (item: Node, expandedState: Set<string>) => {
    this.props.setExpandedState(expandedState);
  };

  onKeyDown = (e: KeyboardEvent) => {
    const { focusedItem } = this.state;

    if (e.keyCode === 13 && focusedItem) {
      this.selectItem(focusedItem);
    }
  };

  isEmpty() {
    const { sourceTree } = this.state;
    return sourceTree.contents.length === 0;
  }

  renderItem = (
    item: Node,
    depth: number,
    focused: boolean,
    _,
    expanded: boolean,
    { setExpanded }: { setExpanded: SetExpanded }
  ) => {
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
        onClick={(e: MouseEvent) => {
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
    switch (name) {
      case "ng://":
        return "Angular";
      case "webpack://":
        return "Webpack";
      case "moz-extension://":
        return L10N.getStr("extensionsText");
      default:
        return name;
    }
  }

  renderEmptyElement(message) {
    return (
      <div key="empty" className="no-sources-message">
        {message}
      </div>
    );
  }

  renderProjectRootHeader() {
    const { projectRoot } = this.props;

    if (!projectRoot) {
      return null;
    }

    const rootLabel = projectRoot.split("/").pop();

    return (
      <div key="root" className="sources-clear-root-container">
        <button
          className="sources-clear-root"
          onClick={() => this.props.clearProjectDirectoryRoot()}
          title={L10N.getStr("removeDirectoryRoot.label")}
        >
          <Svg name="home" />
          <Svg name="breadcrumb" class />
          <span className="sources-clear-root-label">{rootLabel}</span>
        </button>
      </div>
    );
  }

  getRoots = () => {
    const { projectRoot } = this.props;
    const { sourceTree } = this.state;

    const sourceContents = sourceTree.contents[0];
    const rootLabel = projectRoot.split("/").pop();

    // The "sourceTree.contents[0]" check ensures that there are contents
    // A custom root with no existing sources will be ignored
    if (projectRoot) {
      if (sourceContents && sourceContents.name !== rootLabel) {
        return sourceContents.contents[0].contents;
      }
      return sourceContents.contents;
    }

    return sourceTree.contents;
  };

  renderTree() {
    const { expanded } = this.props;
    const { highlightItems, listItems, parentMap } = this.state;

    const treeProps = {
      autoExpandAll: false,
      autoExpandDepth: expanded ? 0 : 1,
      expanded,
      getChildren: (item: Node) => (nodeHasChildren(item) ? item.contents : []),
      getParent: (item: Node) => parentMap.get(item),
      getPath: this.getPath,
      getRoots: this.getRoots,
      highlightItems,
      itemHeight: 21,
      key: this.isEmpty() ? "empty" : "full",
      listItems,
      onCollapse: this.onCollapse,
      onExpand: this.onExpand,
      onFocus: this.focusItem,
      renderItem: this.renderItem,
      preventBlur: true
    };

    return <ManagedTree {...treeProps} />;
  }

  renderPane(...children) {
    const { projectRoot } = this.props;

    return (
      <div
        key="pane"
        className={classnames("sources-pane", {
          "sources-list-custom-root": projectRoot
        })}
      >
        {children}
      </div>
    );
  }

  render() {
    const { projectRoot } = this.props;

    if (this.isEmpty()) {
      if (projectRoot) {
        return this.renderPane(
          this.renderProjectRootHeader(),
          this.renderEmptyElement(L10N.getStr("sources.noSourcesAvailableRoot"))
        );
      }

      return this.renderPane(
        this.renderEmptyElement(L10N.getStr("sources.noSourcesAvailable"))
      );
    }

    return this.renderPane(
      this.renderProjectRootHeader(),
      <div key="tree" className="sources-list" onKeyDown={this.onKeyDown}>
        {this.renderTree()}
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
    sources: getRelativeSources(state)
  };
};

const actionCreators = {
  setExpandedState,
  selectSource,
  setProjectDirectoryRoot,
  clearProjectDirectoryRoot
};

export default connect(mapStateToProps, actionCreators)(SourcesTree);
