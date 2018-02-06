// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Tabs reducer
 * @module reducers/tabs
 */

import * as I from "immutable";
import { createSelector } from "reselect";
import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { List } from "immutable";
import type { Action } from "../actions/types";
import type { Tab } from "../../types";
import type { Record } from "../utils/makeRecord";

type TabList = List<Tab>;
export type TabsState = {
  currentTabIndex: number,
  tabs: TabList
};

export function initialState(): Record<TabsState> {
  return makeRecord({
    currentTabIndex: -1,
    tabs: I.List()
  })();
}

export default function update(
  state: Record<TabsState> = initialState(),
  action: Action
): Record<TabsState> {
  switch (action.type) {
    case "ADD_TAB":
      return state.merge({
        tabs: updateTabList({ tabsState: state }, action.tab, action.tabIndex),
        currentTabIndex: action.tabIndex || 0
      });

    case "SELECT_TAB":
      return state.set("currentTabIndex", action.tabIndex);

    case "CLOSE_TAB":
      const tabSet = removeFromTabList({ tabsState: state }, [action.id]);
      prefs.tabs = _tabs;
      return state.merge({ _tabs, currentTabIndex: action.tabIndex });

    case "CLOSE_TABS":
      const tabs = removeFromTabList({ tabsState: state }, action.ids);
      prefs.tabs = tabs;
      return state.merge({ tabs, currentTabIndex: action.tabIndex });
  }

  return state;
}

/**
 * Adds the new tab to the list or moves the tab in the list if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(state: OuterState, currentTab: Tab, moveIndex?: number) {
  let tabs = state.tabsState.get("tabs");
  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.id);
  if (moveIndex !== undefined) {
    // moving the tab
    tabs = tabs.delete(currentIndex).insert(moveIndex, currentTab);
  } else {
    // insert a new tab
    if (currentIndex === -1) {
      tabs = tabs.insert(0, currentTab);
    }
  }

  prefs.tabs = tabs.toJS();
  return tabs;
}

/**
 * Gets the next tab to select when a tab closes. Heuristics:
 * 1. if the selected tab is available, it remains selected
 * 2. if it is gone, the next available tab to the left should be active
 * 3. if the first tab is active and closed, select the second tab
 *
 * @memberof reducers/sources
 * @static
 */
export function selectNewTab(state: OuterState, availableTabs: any): number {
  const selectedLocation = state.sources.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  if (availableTabs.includes(selectedTabUrl)) {
    const sources = state.sources.sources;
    if (!sources) {
      return "";
    }

    const selectedSource = sources.find(
      source => source.get("url") == selectedTabUrl
    );

    if (selectedSource) {
      return selectedSource.get("id");
    }

    return "";
  }

  const tabUrls = state.sources.tabs.toJS();
  const leftNeighborIndex = Math.max(tabUrls.indexOf(selectedTabUrl) - 1, 0);
  const lastAvailbleTabIndex = availableTabs.size - 1;
  const newSelectedTabIndex = Math.min(leftNeighborIndex, lastAvailbleTabIndex);
  const tabSource = getSourceByUrlInSources(
    state.sources.sources,
    availableTab
  );

  if (tabSource) {
    return tabSource.get("id");
  }

  return "";
}

function removeFromTabList(state: OuterState, tabIds: Array<string>) {
  let tabs = state.tabsState.get("tabs");
  return tabIds.reduce((tabs, id) => tabs.filter(tab => tab != id), tabs);
}

function restoreTabs() {
  const prefsTabs = prefs.tabs || [];
  if (prefsTabs.length == 0) {
    return;
  }
  return prefsTabs;
}

type OuterState = { tabs: Record<TabsState> };

const getTabsState = state => state.tabs;

export const getTabs = createSelector(getTabsState, tabs => tabs.tabs);

export function getSelectedTab(state: OuterState) {
  const currentIndex = state.tabs.get("currentTabIndex");
  return state.tabs.get("tabs").get(currentIndex);
}
