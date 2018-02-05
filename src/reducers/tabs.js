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
      const _tabs = removeFromTabList({ tabsState: state }, [action.id]);
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
