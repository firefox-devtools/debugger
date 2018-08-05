/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import classnames from "classnames";
import { showMenu } from "devtools-contextmenu";

import SourceIcon from "../shared/SourceIcon";
import Svg from "../shared/Svg";

import { isDirectory } from "../../utils/sources-tree";
import { copyToTheClipboard } from "../../utils/clipboard";
import { features } from "../../utils/prefs";

import type { TreeNode } from "../../utils/sources-tree/types";

import type { Source } from "../../types";
const {
  unformatUrl: sourceMapUnformatUrl
} = require("devtools-source-map/src/utils");

type Props = {
  debuggeeUrl: string,
  projectRoot: string,
  source: ?Source,
  item: TreeNode,
  depth: number,
  focused: boolean,
  expanded: boolean,
  setExpanded: (TreeNode, boolean, boolean) => void,
  focusItem: TreeNode => void,
  selectItem: TreeNode => void,
  clearProjectDirectoryRoot: () => void,
  setProjectDirectoryRoot: string => void
};

type State = {};

export default class SourceTreeItem extends Component<Props, State> {
  getIcon(item: TreeNode, depth: number) {
    const { debuggeeUrl, projectRoot, source } = this.props;

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

    if (source) {
      return <SourceIcon source={source} />;
    }

    return null;
  }

  onClick = (e: MouseEvent) => {
    const { expanded, item, focusItem, setExpanded, selectItem } = this.props;

    focusItem(item);

    if (isDirectory(item)) {
      setExpanded(item, !!expanded, e.altKey);
    } else {
      selectItem(item);
    }
  };

  onContextMenu = (event: Event, item: TreeNode) => {
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
          click: () => copyToTheClipboard(sourceMapUnformatUrl(contents.url))
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

  renderItemArrow() {
    const { item, expanded } = this.props;
    return isDirectory(item) ? (
      <img className={classnames("arrow", { expanded })} />
    ) : (
      <i className="no-arrow" />
    );
  }

  renderItemName(name: string) {
    switch (name) {
      case "ng://":
        return "Angular";
      case "webpack://":
        return "Webpack";
      case "moz-extension://":
        return L10N.getStr("extensionsText");
      default:
        // we add " [sm]" to original sources if they have same url as generated
        return name.replace("%20[sm]", " [sm]");
    }
  }

  render() {
    const { item, depth, focused } = this.props;

    return (
      <div
        className={classnames("node", { focused })}
        key={item.path}
        onClick={this.onClick}
        onContextMenu={e => this.onContextMenu(e, item)}
      >
        {this.renderItemArrow()}
        {this.getIcon(item, depth)}
        <span className="label"> {this.renderItemName(item.name)} </span>
      </div>
    );
  }
}
