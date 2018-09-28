/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Tabs reducer
 * @module reducers/tabs
 */

import { createSelector } from "reselect";
import { isOriginalId } from "devtools-source-map";
import move from "lodash-move";

import { asyncStore } from "../utils/prefs";
import {
  getSource,
  getSources,
  getUrls,
  getSourceByURL,
  getSourceByUrlInSources
} from "./sources";

import type { Action } from "../actions/types";
import type { SourcesState } from "./sources";
import type { Source } from "../types";

type Tab = { url: string, framework?: string | null, isOriginal: boolean };
export type TabList = Tab[];

function isSimilarTab(tab: Tab, url: string, isOriginal: boolean) {
  return tab.url === url && tab.isOriginal === isOriginal;
}

function update(state: TabList = [], action: Action): TabList {
  switch (action.type) {
    case "ADD_TAB":
    case "UPDATE_TAB":
      return updateTabList(state, action);

    case "MOVE_TAB":
      return moveTabInList(state, action);

    case "CLOSE_TAB":
    case "CLOSE_TABS":
      asyncStore.tabs = action.tabs;
      return action.tabs;

    default:
      return state;
  }
}

export function removeSourceFromTabList(
  tabs: TabList,
  source: Source
): TabList {
  return tabs.filter(
    tab => tab.url !== source.url || tab.isOriginal != isOriginalId(source.id)
  );
}

export function removeSourcesFromTabList(tabs: TabList, sources: Source[]) {
  return sources.reduce(
    (t, source) => removeSourceFromTabList(t, source),
    tabs
  );
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/tabs
 * @static
 */
function updateTabList(
  tabs: TabList,
  { url, framework = null, isOriginal = false }
) {
  const currentIndex = tabs.findIndex(tab =>
    isSimilarTab(tab, url, isOriginal)
  );

  if (currentIndex === -1) {
    tabs = [{ url, framework, isOriginal }, ...tabs];
  } else if (framework) {
    tabs[currentIndex].framework = framework;
  }

  asyncStore.tabs = tabs;
  return tabs;
}

function moveTabInList(tabs: TabList, { url, tabIndex: newIndex }) {
  const currentIndex = tabs.findIndex(tab => tab.url == url);
  tabs = move(tabs, currentIndex, newIndex);
  asyncStore.tabs = tabs;
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

  const matchingTab = availableTabs.find(tab =>
    isSimilarTab(tab, selectedTab.url, isOriginalId(selectedLocation.sourceId))
  );

  if (matchingTab) {
    const sources = state.sources.sources;
    if (!sources) {
      return "";
    }

    const selectedSource = getSourceByURL(
      state,
      selectedTab.url,
      isOriginalId(selectedTab.id)
    );

    if (selectedSource) {
      return selectedSource.id;
    }

    return "";
  }

  const tabUrls = state.tabs.map(t => t.url);
  const leftNeighborIndex = Math.max(tabUrls.indexOf(selectedTab.url) - 1, 0);
  const lastAvailbleTabIndex = availableTabs.length - 1;
  const newSelectedTabIndex = Math.min(leftNeighborIndex, lastAvailbleTabIndex);
  const availableTab = availableTabs[newSelectedTabIndex];

  if (availableTab) {
    const tabSource = getSourceByUrlInSources(
      getSources(state),
      getUrls(state),
      availableTab.url,
      availableTab.isOriginal
    );

    if (tabSource) {
      return tabSource.id;
    }
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
    tabs.filter(tab =>
      getSourceByUrlInSources(sources, urls, tab.url, tab.isOriginal)
    )
);

export const getSourcesForTabs = createSelector(
  getSourceTabs,
  getSources,
  getUrls,
  (tabs, sources, urls) => {
    return tabs
      .map(tab =>
        getSourceByUrlInSources(sources, urls, tab.url, tab.isOriginal)
      )
      .filter(Boolean);
  }
);

export default update;
