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
  let tabs, tabIndex;
  switch (action.type) {
    case "ADD_TAB":
      tabs = updateTabList({ tabsState: state }, action.tab, action.tabIndex);
      return state.merge({
        tabs,
        currentTabIndex: action.tabIndex || 0
      });

    case "SELECT_TAB":
      return state.set("currentTabIndex", action.tabIndex);

    case "CLOSE_TAB":
      tabs = removeFromTabList({ tabsState: state }, [action.id]);
      tabIndex = selectNewTab({ tabsState: state }, tabs);
      prefs.tabs = tabs;
      return state.merge({ tabs, currentTabIndex: tabIndex });

    case "CLOSE_TABS":
      tabs = removeFromTabList({ tabsState: state }, action.ids);
      tabIndex = selectNewTab({ tabsState: state }, tabs);
      prefs.tabs = tabs;
      return state.merge({ tabs, currentTabIndex: tabIndex });
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
  const currentTabIndex = state.tabsState.get("currentTabIndex");
  const prevTabs = state.tabsState.get("tabs");
  const leftNeighborIndex = Math.max(currentTabIndex - 1, 0);
  const lastAvailbleTabIndex = availableTabs.size - 1;
  return Math.min(leftNeighborIndex, lastAvailbleTabIndex);
}

function removeFromTabList(state: OuterState, tabIds: Array<string>) {
  let tabs = state.tabsState.get("tabs");
  return tabIds.reduce((tabs, id) => tabs.filter(tab => tab.id != id), tabs);
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

export function getTabIndex(state: OuterState) {
  return state.tabs.get("currentTabIndex");
}

export function getSelectedTab(state: OuterState) {
  const currentIndex = getTabIndex(state);
  return state.tabs.get("tabs").get(currentIndex);
}
