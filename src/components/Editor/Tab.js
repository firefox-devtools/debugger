/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { showMenu, buildMenu } from "devtools-contextmenu";

import CloseButton from "../shared/Button/Close";

import type { List } from "immutable";
import type { SourceRecord } from "../../reducers/sources";

import actions from "../../actions";

import {
  getFilename,
  getFileURL,
  getRawSourceURL,
  isPretty
} from "../../utils/source";
import { copyToTheClipboard } from "../../utils/clipboard";
import { getSourceAnnotation, getTabMenuItems } from "../../utils/tabs";

import {
  getSelectedSource,
  getSourceMetaData,
  getActiveSearch,
  getTabs,
  getSource,
  getSelectedTab
} from "../../selectors";

import classnames from "classnames";

type TabList = List<any>;

type Props = {
  tabs: TabList,
  selectSource: Object => void,
  selectedTab: any,
  selectedSource: SourceRecord,
  closeTab: string => void,
  closeTabs: (List<string>) => void,
  togglePrettyPrint: string => void,
  showSource: string => void,
  tab: any,
  tabIndex: number,
  activeSearch: string,
  getMetaData: string => any,
  getTabSource: string => SourceRecord
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
      tabs,
      showSource,
      togglePrettyPrint,
      getTabSource
    } = this.props;

    if (!tab) {
      return;
    }

    const source = getTabSource(tab);
    const tabIds = tabs.map(t => t.id);
    const otherTabIds = tabIds.filter(id => id !== tab.id);

    const isPrettySource = isPretty(source);
    const tabMenuItems = getTabMenuItems();
    const items = [
      {
        item: {
          ...tabMenuItems.closeTab,
          click: () => closeTab(tab.id)
        }
      },
      {
        item: {
          ...tabMenuItems.closeOtherTabs,
          click: () => closeTabs(otherTabIds)
        },
        hidden: () => tabs.size === 1
      },
      {
        item: {
          ...tabMenuItems.closeTabsToEnd,
          click: () => {
            const tabIndex = tabIds.findIndex(id => id == tab.id);
            closeTabs(tabIds.filter((id, index) => index > tabIndex));
          }
        },
        hidden: () =>
          tabs.size === 1 ||
          tabs.some((t, i) => t === tab && tabs.size - 1 === i)
      },
      {
        item: { ...tabMenuItems.closeAllTabs, click: () => closeTabs(tabIds) }
      },
      { item: { type: "separator" } },
      {
        item: {
          ...tabMenuItems.copySourceUri2,
          click: () => copyToTheClipboard(tab)
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

  /*isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }*/

  render() {
    const {
      selectedSource,
      selectedTab,
      selectTab,
      selectSource,
      closeTab,
      tab,
      getMetaData,
      getTabSource,
      tabIndex
    } = this.props;

    const source = getTabSource(tab.id);
    const sourceAnnotation = getSourceAnnotation(source, getMetaData);
    /*&& (!this.isProjectSearchEnabled() && !this.isSourceSearchEnabled());*/

    function handleTabClick(e) {
      e.preventDefault();
      e.stopPropagation();

      // Accommodate middle click to close tab
      if (e.button === 1) {
        return closeTab(source.get("url"));
      }

      return selectSource(sourceId);
    }

    const className = classnames("source-tab", {
      active: tab.id === selectedTab.id,
      pretty: isPretty(source)
    });

    return (
      <div
        className={className}
        key={tab.id}
        onMouseUp={handleTabClick}
        onClick={() => {
          selectSource(tab.id);
          selectTab(tabIndex);
        }}
        onContextMenu={e => this.onTabContextMenu(e, tab.id)}
        title={tab.tooltip}
      >
        {sourceAnnotation}
        <div className="filename">{tab.title}</div>
        <CloseButton
          handleClick={event => {
            event.stopPropagation();
            closeTab(tab.id);
          }}
          tooltip={L10N.getStr("sourceTabs.closeTabButtonTooltip")}
        />
      </div>
    );
  }
}
export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      tabs: getTabs(state),
      selectedSource: getSelectedSource(state),
      selectedTab: getSelectedTab(state),
      getMetaData: sourceId => getSourceMetaData(state, sourceId),
      getTabSource: sourceId => getSource(state, sourceId),
      activeSearch: getActiveSearch(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Tab);
