// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Sources reducer
 * @module reducers/sources
 */

import * as I from "immutable";
import { createSelector } from "reselect";
import makeRecord from "../utils/makeRecord";
import { getPrettySourceURL } from "../utils/source";
import { prefs } from "../utils/prefs";

import type { Map, List } from "immutable";
import type { Source, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type Tab = {
  id: string,
  hidden: boolean,
  label: string
};

export type SourceRecord = Record<Source>;
export type SourcesMap = Map<string, SourceRecord>;
type TabList = List<Tab>;

export type TabsState = {
  tabs: TabList
};

export function initialState(): Record<SourcesState> {
  return makeRecord(
    ({
      currentIndex: undefined,
      tabs: I.List(restoreTabs())
    }: TabsState)
  )();
}

function update(
  state: Record<SourcesState> = initialState(),
  action: Action
): Record<SourcesState> {
  let location = null;

  switch (action.type) {
    case "ADD_TAB":
      return state.merge({
        tabs: updateTabList({ sources: state }, action.source.url)
      });

    case "MOVE_TAB":
      return state.merge({
        tabs: updateTabList({ sources: state }, action.url, action.tabIndex)
      });

    case "CLOSE_TAB":
      prefs.tabs = action.tabs;
      return state.merge({ tabs: action.tabs });

    case "CLOSE_TABS":
      prefs.tabs = action.tabs;
      return state.merge({ tabs: action.tabs });
  }

  return state;
}

function updateSource(state: Record<SourcesState>, source: Object | Source) {
  if (!source.id) {
    return state;
  }

  return state.mergeIn(["sources", source.id], source);
}

export function removeSourceFromTabList(tabs: any, url: string) {
  return tabs.filter(tab => tab != url);
}

export function removeSourcesFromTabList(tabs: any, urls: Array<string>) {
  return urls.reduce((t, url) => removeSourceFromTabList(t, url), tabs);
}

function restoreTabs() {
  let prefsTabs = prefs.tabs || [];
  if (prefsTabs.length == 0) {
    return;
  }

  return prefsTabs;
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(state: OuterState, url: ?string, tabIndex?: number) {
  let tabs = state.sources.get("tabs");

  const urlIndex = tabs.indexOf(url);
  const includesUrl = !!tabs.find(tab => tab == url);

  if (includesUrl) {
    if (tabIndex != undefined) {
      tabs = tabs.delete(urlIndex).insert(tabIndex, url);
    }
  } else {
    tabs = tabs.insert(0, url);
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
export function getNewSelectedSourceId(
  state: OuterState,
  availableTabs: any
): string {
  const selectedLocation = state.sources.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  const selectedTab = state.sources.sources.get(selectedLocation.sourceId);

  const selectedTabUrl = selectedTab ? selectedTab.get("url") : "";

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
  const availableTab = availableTabs.toJS()[newSelectedTabIndex];
  const tabSource = getSourceByUrlInSources(
    state.sources.sources,
    availableTab
  );

  if (tabSource) {
    return tabSource.get("id");
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
type OuterState = { sources: Record<SourcesState> };

const getSourcesState = state => state.sources;

function getSourceByUrlInSources(sources: SourcesMap, url: string) {
  if (!url) {
    return null;
  }

  return sources.find(source => source.get("url") === url);
}

const getTabs = createSelector(getSourcesState, sources => sources.tabs);

export const getSourceTabs = createSelector(
  getTabs,
  getSources,
  (tabs, sources) => tabs.filter(tab => getSourceByUrlInSources(sources, tab))
);

export const getSearchTabs = createSelector(
  getTabs,
  getSources,
  (tabs, sources) => tabs.filter(tab => !getSourceByUrlInSources(sources, tab))
);

export const getSourcesForTabs = createSelector(
  getSourceTabs,
  getSources,
  (tabs: TabList, sources: SourcesMap) => {
    return tabs
      .map(tab => getSourceByUrlInSources(sources, tab))
      .filter(source => source);
  }
);

export default update;
