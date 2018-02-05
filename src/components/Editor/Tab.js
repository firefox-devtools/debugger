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

    const source = getTabSource(tab);
    const otherTabs = tabs.filter(t => t.id !== tab);
    const sourceTab = tabs.find(t => t.id == tab);
    const tabIds = tabs.map(t => t.id);

    if (!sourceTab) {
      return;
    }

    const isPrettySource = isPretty(source);
    const tabMenuItems = getTabMenuItems();
    const items = [
      {
        item: {
          ...tabMenuItems.closeTab,
          click: () => closeTab(tab)
        }
      },
      {
        item: {
          ...tabMenuItems.closeOtherTabs,
          click: () => closeTabs(otherTabs)
        },
        hidden: () => tabs.size === 1
      },
      {
        item: {
          ...tabMenuItems.closeTabsToEnd,
          click: () => {
            const tabIndex = tabs.findIndex(t => t.id == tab);
            closeTabs(tabs.filter((t, i) => i > tabIndex));
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
      selectSource,
      closeTab,
      tab,
      getMetaData,
      getTabSource
    } = this.props;

    const source = getTabSource(tab.id);
    const active = tab.id === selectedTab.id;
    const isPrettyCode = isPretty(source);
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
      active,
      pretty: isPrettyCode
    });

    return (
      <div
        className={className}
        key={tab.id}
        onMouseUp={handleTabClick}
        onClick={() => {
          selectSource(tab.id);
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
