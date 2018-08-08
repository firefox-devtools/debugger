/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Tabs reducer
 * @module reducers/tabs
 */

import { createSelector } from "reselect";
import move from "lodash-move";

import { prefs } from "../utils/prefs";
import {
  getSource,
  getSources,
  getUrls,
  getSourceByURL,
  getSourceByUrlInSources
} from "./sources";

import type { Action } from "../actions/types";
import type { SourcesState } from "./sources";

type Tab = string;
export type TabList = Tab[];

function update(state: TabList = prefs.tabs || [], action: Action): TabList {
  switch (action.type) {
    case "ADD_TAB":
      return updateTabList(state, action.url);

    case "MOVE_TAB":
      return updateTabList(state, action.url, action.tabIndex);

    case "CLOSE_TAB":
    case "CLOSE_TABS":
      prefs.tabs = action.tabs;
      return action.tabs;

    default:
      return state;
  }
}

export function removeSourceFromTabList(tabs: TabList, url: string): TabList {
  return tabs.filter(tab => tab !== url);
}

export function removeSourcesFromTabList(tabs: TabList, urls: TabList) {
  return urls.reduce((t, url) => removeSourceFromTabList(t, url), tabs);
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/tabs
 * @static
 */
function updateTabList(tabs: TabList, url: string, newIndex: ?number) {
  const currentIndex = tabs.indexOf(url);
  if (currentIndex === -1) {
    tabs = [url, ...tabs];
  } else if (newIndex !== undefined) {
    tabs = move(tabs, currentIndex, newIndex);
  }

  prefs.tabs = tabs;
  return tabs;
}

/**
 * Gets the next tab to select when a tab closes. Heuristics:
 * 1. if the selected tab is available, it remains selected
 * 2. if it is gone, the next available tab to the left should be active
 * 3. if the first tab is active and closed, select the second tab
 *
 * @memberof reducers/tabs
 * @static
 */
export function getNewSelectedSourceId(
  state: OuterState,
  availableTabs: TabList
): string {
  const selectedLocation = state.sources.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  const selectedTab = getSource(state, selectedLocation.sourceId);
  if (!selectedTab) {
    return "";
  }

  if (availableTabs.includes(selectedTab.url)) {
    const sources = state.sources.sources;
    if (!sources) {
      return "";
    }

    const selectedSource = getSourceByURL(state, selectedTab.url);

    if (selectedSource) {
      return selectedSource.id;
    }

    return "";
  }

  const tabUrls = state.tabs;
  const leftNeighborIndex = Math.max(tabUrls.indexOf(selectedTab.url) - 1, 0);
  const lastAvailbleTabIndex = availableTabs.length - 1;
  const newSelectedTabIndex = Math.min(leftNeighborIndex, lastAvailbleTabIndex);
  const availableTab = availableTabs[newSelectedTabIndex];
  const tabSource = getSourceByUrlInSources(
    getSources(state),
    getUrls(state),
    availableTab
  );

  if (tabSource) {
    return tabSource.id;
  }

  return "";
}

// Selectors

// Unfortunately, it's really hard to make these functions accept just
// the state that we care about and still type it with Flow. The
// problem is that we want to re-export all selectors from a single
// module for the UI, and all of those selectors should take the
// top-level app state, so we'd have to "wrap" them to automatically
// pick off the piece of state we're interested in. It's impossible
// (right now) to type those wrapped functions.
type OuterState = { tabs: TabList, sources: SourcesState };

export const getTabs = (state: OuterState): TabList => state.tabs;

export const getSourceTabs = createSelector(
  getTabs,
  getSources,
  getUrls,
  (tabs, sources, urls) =>
    tabs.filter(tab => getSourceByUrlInSources(sources, urls, tab))
);

export const getSourcesForTabs = createSelector(
  getSourceTabs,
  getSources,
  getUrls,
  (tabs, sources, urls) => {
    return tabs
      .map(tab => getSourceByUrlInSources(sources, urls, tab))
      .filter(source => source);
  }
);

export default update;
