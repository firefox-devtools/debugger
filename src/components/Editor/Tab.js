/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { showMenu, buildMenu } from "devtools-contextmenu";

import SourceIcon from "../shared/SourceIcon";
import { CloseButton } from "../shared/Button";

import { truncateMiddleText } from "../../utils/text";

import type { List } from "immutable";
import type { Source } from "../../types";

import actions from "../../actions";

import {
  getFilename,
  getFileURL,
  getRawSourceURL,
  isPretty
} from "../../utils/source";
import { getUnicodeUrlPath } from "devtools-modules";
import { copyToTheClipboard } from "../../utils/clipboard";
import { getTabMenuItems } from "../../utils/tabs";

import {
  getSelectedSource,
  getActiveSearch,
  getSourcesForTabs
} from "../../selectors";

import classnames from "classnames";

type SourcesList = List<Source>;

type Props = {
  tabSources: SourcesList,
  selectedSource: Source,
  source: Source,
  activeSearch: string,
  selectSpecificSource: string => void,
  closeTab: string => void,
  closeTabs: (List<string>) => void,
  togglePrettyPrint: string => void,
  showSource: string => void
};

class Tab extends PureComponent<Props> {
  onTabContextMenu = (event, tab: string) => {
    event.preventDefault();
    this.showContextMenu(event, tab);
  };

  showContextMenu(e, tab: string) {
    const {
      closeTab,
      closeTabs,
      tabSources,
      showSource,
      togglePrettyPrint,
      selectedSource
    } = this.props;

    const otherTabs = tabSources.filter(t => t.id !== tab);
    const sourceTab = tabSources.find(t => t.id == tab);
    const tabURLs = tabSources.map(t => t.url);
    const otherTabURLs = otherTabs.map(t => t.url);

    if (!sourceTab) {
      return;
    }

    const isPrettySource = isPretty(sourceTab);
    const tabMenuItems = getTabMenuItems();
    const items = [
      {
        item: {
          ...tabMenuItems.closeTab,
          click: () => closeTab(sourceTab.url)
        }
      },
      {
        item: {
          ...tabMenuItems.closeOtherTabs,
          click: () => closeTabs(otherTabURLs)
        },
        hidden: () => tabSources.size === 1
      },
      {
        item: {
          ...tabMenuItems.closeTabsToEnd,
          click: () => {
            const tabIndex = tabSources.findIndex(t => t.id == tab);
            closeTabs(tabURLs.filter((t, i) => i > tabIndex));
          }
        },
        hidden: () =>
          tabSources.size === 1 ||
          tabSources.some((t, i) => t === tab && tabSources.size - 1 === i)
      },
      {
        item: { ...tabMenuItems.closeAllTabs, click: () => closeTabs(tabURLs) }
      },
      { item: { type: "separator" } },
      {
        item: {
          ...tabMenuItems.copyToClipboard,
          disabled: selectedSource.id !== tab,
          click: () => copyToTheClipboard(sourceTab.text)
        }
      },
      {
        item: {
          ...tabMenuItems.copySourceUri2,
          click: () => copyToTheClipboard(getRawSourceURL(sourceTab.url))
        }
      }
    ];

    items.push({
      item: { ...tabMenuItems.showSource, click: () => showSource(tab) }
    });

    if (!isPrettySource) {
      items.push({
        item: {
          ...tabMenuItems.prettyPrint,
          click: () => togglePrettyPrint(tab)
        }
      });
    }

    showMenu(e, buildMenu(items));
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }

  render() {
    const {
      selectedSource,
      selectSpecificSource,
      closeTab,
      source
    } = this.props;
    const filename = getFilename(source);
    const sourceId = source.id;
    const active =
      selectedSource &&
      sourceId == selectedSource.id &&
      (!this.isProjectSearchEnabled() && !this.isSourceSearchEnabled());
    const isPrettyCode = isPretty(source);

    function onClickClose(e) {
      e.stopPropagation();
      closeTab(source.url);
    }

    function handleTabClick(e) {
      e.preventDefault();
      e.stopPropagation();

      // Accommodate middle click to close tab
      if (e.button === 1) {
        return closeTab(source.url);
      }

      return selectSpecificSource(sourceId);
    }

    const className = classnames("source-tab", {
      active,
      pretty: isPrettyCode
    });

    return (
      <div
        className={className}
        key={sourceId}
        onMouseUp={handleTabClick}
        onContextMenu={e => this.onTabContextMenu(e, sourceId)}
        title={getFileURL(source)}
      >
        <SourceIcon
          source={source}
          shouldHide={icon => ["file", "javascript"].includes(icon)}
        />
        <div className="filename">
          {truncateMiddleText(getUnicodeUrlPath(filename), 30)}
        </div>
        <CloseButton
          handleClick={onClickClose}
          tooltip={L10N.getStr("sourceTabs.closeTabButtonTooltip")}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, { source }) => {
  const selectedSource = getSelectedSource(state);

  return {
    tabSources: getSourcesForTabs(state),
    selectedSource: selectedSource,
    activeSearch: getActiveSearch(state)
  };
};

export default connect(mapStateToProps, {
  selectSpecificSource: actions.selectSpecificSource,
  closeTab: actions.closeTab,
  closeTabs: actions.closeTabs,
  togglePrettyPrint: actions.togglePrettyPrint,
  showSource: actions.showSource
})(Tab);
