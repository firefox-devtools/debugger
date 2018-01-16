// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Tabs reducer
 * @module reducers/tabs
 */

import * as I from "immutable";
import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { List } from "immutable";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type Tab = {
  id: string,
  title: string,
  tooltip?: string,
  sourceId: string
};

type TabList = List<Tab>;
export type TabsState = {
  currentTabIndex: number,
  tabs: TabList
}

export function initialState(): Record<TabsState> {
  return makeRecord({
    currentTabIndex: 0,
    tabs: I.List()
  })
}

export default function update(state: Record<TabsState>, action: Action): Record<TabsState> {
  switch (action.type) {
    case "ADD_TAB":
      const tab = { id: action.id, title: action.title, tooltip: action.tooltip };
      return state.merge({ tabs: updateTabList({ tabsState: state }, tab, action.tabIndex) });

    case "SELECT_TAB":
      return state.set("currentTabIndex", action.tabIndex);

    case "MOVE_TAB":
      const tab = state.tabs.find(tab => tab.id === id);
      return state.merge({
        tabs: updateTabList({ tabsState: state }, tab, action.tabIndex)
      });

    case "CLOSE_TAB":
      const tabs = removeFromTabList({ tabsState: state }, [action.id]);
      prefs.tabs = tabs;
      return state.merge({ tabs });

    case "CLOSE_TABS":
      const tabs = removeFromTabList({ tabsState: state }, action.ids);
      prefs.tabs = tabs;
      return state.merge({ tabs });
  }

  return state;
};

/**
 * Adds the new tab to the list or moves the tab in the list if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(state: OuterState, currentTab: Tab, moveIndex?: number) {
  let tabs = state.tabsState.get("tabs");

  const currentTabIndex = tabs.findIndex(tab => tab.id === id);

  if (currentTabIndex === -1) {
    tabs = tabs.insert(0, currentTab);
  }

  if (moveIndex !== undefined) {
    const currentIndex = tabs.indexOf(currentTab);
    tabs = tabs.delete(currentIndex).insert(moveIndex, currentTab);
  }

  prefs.tabs = tabs.toJS();
  return tabs;
}

export function removeFromTabList(state: OuterState, tabIds: Array<string>) {
  let tabs = state.tabsState.get("tabs");
  return tabIds.reduce((tabs, id) => tabs.filter(tab => tab != id)), tabs);
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

const getTabs = createSelector(getTabsState, tabs => tabs.tabs);
