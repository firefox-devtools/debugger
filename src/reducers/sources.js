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
import type { Source, SourceText, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type Tab = string;
export type SourceRecord = Record<Source>;
export type SourceTextRecord = Record<SourceText>;
export type SourcesMap = Map<string, SourceRecord>;
type SourceTextMap = Map<string, SourceTextRecord>;
type TabList = List<Tab>;

export type SourcesState = {
  sources: SourcesMap,
  selectedLocation?: {
    sourceId: string,
    line?: number,
    column?: number
  },
  pendingSelectedLocation?: {
    url: string,
    line?: number,
    column?: number
  },
  selectedLocation?: Location,
  sourcesText: SourceTextMap,
  tabs: TabList
};

export const State = makeRecord(
  ({
    sources: I.Map(),
    selectedLocation: undefined,
    pendingSelectedLocation: prefs.pendingSelectedLocation,
    sourcesText: I.Map(),
    tabs: I.List(restoreTabs())
  }: SourcesState)
);

function update(
  state: Record<SourcesState> = State(),
  action: Action
): Record<SourcesState> {
  let availableTabs = null;
  let location = null;

  switch (action.type) {
    case "ADD_SOURCE": {
      const source: Source = action.source;
      return state.mergeIn(["sources", action.source.id], source);
    }

    case "ADD_SOURCES": {
      action.sources.forEach(source => {
        state = state.mergeIn(["sources", source.id], source);
      });

      return state;
    }

    case "SELECT_SOURCE":
      const sourceUrl = action.source.url || "";

      location = {
        line: action.line,
        url: sourceUrl
      };

      prefs.pendingSelectedLocation = location;

      return state
        .set("selectedLocation", {
          sourceId: action.source.id,
          line: action.line
        })
        .set("pendingSelectedLocation", location)
        .merge({
          tabs: updateTabList({ sources: state }, sourceUrl, action.tabIndex)
        });

    case "SELECT_SOURCE_URL":
      location = {
        url: action.url,
        line: action.line
      };

      prefs.pendingSelectedLocation = location;
      return state.set("pendingSelectedLocation", location);

    case "CLOSE_TAB":
      availableTabs = removeSourceFromTabList(state.tabs, action.url);

      return state.merge({ tabs: availableTabs });

    case "CLOSE_TABS":
      availableTabs = removeSourcesFromTabList(state.tabs, action.urls);

      return state.merge({ tabs: availableTabs });

    case "LOAD_SOURCE_TEXT":
      return _updateText(state, action);

    case "BLACKBOX":
      if (action.status === "done") {
        return state.setIn(
          ["sources", action.source.id, "isBlackBoxed"],
          action.value.isBlackBoxed
        );
      }
      break;

    case "TOGGLE_PRETTY_PRINT":
      return _updateText(state, action);

    case "NAVIGATE":
      const source = getSelectedSource({ sources: state });
      const url = source && source.get("url");
      prefs.pendingSelectedLocation = { url };
      return State().set("pendingSelectedLocation", { url });
  }

  return state;
}

// TODO: Action is coerced to `any` unfortunately because how we type
// asynchronous actions is wrong. The `value` may be null for the
// "start" and "error" states but we don't type it like that. We need
// to rethink how we type async actions.
function _updateText(state, action: any): Record<SourcesState> {
  const source = action.source;
  const sourceText = action.value;

  if (action.status === "start") {
    // Merge this in, don't set it. That way the previous value is
    // still stored here, and we can retrieve it if whatever we're
    // doing fails.
    return state.mergeIn(["sourcesText", source.id], {
      loading: true
    });
  }

  if (action.status === "error") {
    return state.setIn(
      ["sourcesText", source.id],
      I.Map({
        error: action.error
      })
    );
  }

  return state.setIn(
    ["sourcesText", source.id],
    I.Map({
      text: sourceText.text,
      id: source.id,
      contentType: sourceText.contentType
    })
  );
}

function removeSourceFromTabList(tabs, url) {
  const newTabs = tabs.filter(tab => tab != url);
  prefs.tabs = newTabs;
  return newTabs;
}

function removeSourcesFromTabList(tabs, urls) {
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
function updateTabList(state: OuterState, url: string, tabIndex?: number) {
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
  availableTabs
): string {
  state = state.sources;
  const selectedLocation = state.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  const selectedTab = state.sources.get(selectedLocation.sourceId);

  const selectedTabUrl = selectedTab ? selectedTab.get("url") : "";

  if (availableTabs.includes(selectedTabUrl)) {
    const sources = state.sources;
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

  const tabUrls = state.tabs.toJS();
  const leftNeighborIndex = Math.max(tabUrls.indexOf(selectedTabUrl) - 1, 0);
  const lastAvailbleTabIndex = availableTabs.size - 1;
  const newSelectedTabIndex = Math.min(leftNeighborIndex, lastAvailbleTabIndex);
  const availableTab = availableTabs.toJS()[newSelectedTabIndex];
  const tabSource = getSourceByUrlInSources(state.sources, availableTab);

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

export function getSource(state: OuterState, id: string) {
  return getSourceInSources(getSources(state), id);
}

export function getSourceByURL(state: OuterState, url: string): ?SourceRecord {
  return getSourceByUrlInSources(state.sources.sources, url);
}

export function getSourceText(
  state: OuterState,
  id: ?string
): ?SourceTextRecord {
  if (id) {
    return state.sources.sourcesText.get(id);
  }
}

export function getPendingSelectedLocation(state: OuterState) {
  return state.sources.pendingSelectedLocation;
}

export function getPrettySource(state: OuterState, id: string) {
  const source = getSource(state, id);
  if (!source) {
    return;
  }

  return getSourceByURL(state, getPrettySourceURL(source.get("url")));
}

function getSourceByUrlInSources(sources: SourcesMap, url: string) {
  return sources.find(source => source.get("url") === url);
}

export function getSourceInSources(sources: SourcesMap, id: string) {
  return sources.get(id);
}

export const getSources = createSelector(
  getSourcesState,
  sources => sources.sources
);

const getTabs = createSelector(getSourcesState, sources => sources.tabs);

export const getSourceTabs = createSelector(
  getTabs,
  getSources,
  (tabs, sources) => tabs.filter(tab => getSourceByUrlInSources(sources, tab))
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

export const getSelectedLocation = createSelector(
  getSourcesState,
  sources => sources.selectedLocation
);

export const getSelectedSource = createSelector(
  getSelectedLocation,
  getSources,
  (selectedLocation, sources) => {
    if (!selectedLocation) {
      return;
    }

    return sources.get(selectedLocation.sourceId);
  }
);

export default update;
