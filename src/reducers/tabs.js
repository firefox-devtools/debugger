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
import type { Tab } from "../types";
import type { Record } from "../utils/makeRecord";

type TabList = List<Tab>;
export type TabsState = {
  currentTabIndex: number,
  tabs: TabList
};

export function initialTabsState(): Record<TabsState> {
  return makeRecord(
    ({
      currentTabIndex: -1,
      tabs: I.List(restoreTabs())
    }: TabsState)
  )();
}

export default function update(
  state: Record<TabsState> = initialTabsState(),
  action: Action
): Record<TabsState> {
  let tabs, currentTabIndex;
  switch (action.type) {
    case "ADD_TAB":
      const updated = updateTabList(
        { tabsState: state },
        action.tab,
        action.tabIndex
      );
      return state.merge({
        tabs: updated.tabs,
        currentTabIndex: updated.tabIndex
      });

    case "SELECT_TAB":
      return state.set("currentTabIndex", action.tabIndex);

    case "CLOSE_TAB":
      console.log("YOOOO");
      // const index = getTabIndex(state, action.id);
      tabs = removeFromTabList({ tabsState: state }, [action.id]);
      currentTabIndex = selectNewTab({ tabsState: state }, tabs);
      prefs.tabs = tabs;
      console.log(tabs.toJS());

      return state.merge({ tabs, currentTabIndex });

    case "CLOSE_TABS":
      tabs = removeFromTabList({ tabsState: state }, action.ids);
      currentTabIndex = selectNewTab({ tabsState: state }, tabs);

      prefs.tabs = tabs;
      return state.merge({ tabs, currentTabIndex });
  }

  return state;
}

/**
 * Adds the new tab to the list or moves the tab in the list
 * if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(state: OuterState, currentTab: Tab, moveIndex?: number) {
  let tabs = state.tabsState.get("tabs");

  const currentIndex = tabs.findIndex(tab => tab.id === currentTab.id);
  let newTabIndex = currentIndex;
  if (currentIndex && moveIndex !== undefined) {
    // moving the tab
    tabs = tabs.delete(currentIndex).insert(moveIndex, currentTab);
    newTabIndex = moveIndex;
  } else {
    // insert a new tab
    if (currentIndex == -1) {
      tabs = tabs.insert(0, currentTab);
      newTabIndex = 0;
    }
  }

  prefs.tabs = tabs.toJS();
  return {
    tabs,
    tabIndex: newTabIndex
  };
}

function selectNewTab(state: OuterState, availableTabs: any): number {
  const currentTabIndex = state.tabsState.get("currentTabIndex");
  const leftNeighborIndex = Math.max(currentTabIndex - 1, 0);
  const lastAvailbleTabIndex = availableTabs.size - 1;
  if (lastAvailbleTabIndex === currentTabIndex) {
    return lastAvailbleTabIndex;
  }
  return Math.min(leftNeighborIndex, lastAvailbleTabIndex);
}

function removeFromTabList(state: OuterState, tabIds: Array<string>) {
  const tabList = state.tabsState.get("tabs");
  return tabIds.reduce(
    (tabs, url) => tabs.filter(tab => tab.url != url),
    tabList
  );
}

function getTabIndex(state, url) {
  const tabList = state.tabsState.get("tabs");
  return tabList.findIndex(tab => tab.url == url);
}

function restoreTabs() {
  const prefsTabs = prefs.tabs || [];
  if (prefsTabs.length == 0) {
    return;
  }
  return prefsTabs;
}

// selectors

type OuterState = { tabs: Record<TabsState> };

const getTabsState = state => state.tabs;

export const getTabs = createSelector(getTabsState, tabs => tabs.tabs);

export function getCurrentTabIndex(state: OuterState) {
  return state.tabs.get("currentTabIndex");
}

export function getSelectedTab(state: OuterState) {
  const currentIndex = state.tabs.get("currentTabIndex");
  return {
    tabIndex: currentIndex,
    tab: state.tabs.get("tabs").get(currentIndex)
  };
}
