/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Sources reducer
 * @module reducers/sources
 */

import { createSelector } from "reselect";
import move from "lodash-move";
import { getPrettySourceURL, getRawSourceURL } from "../utils/source";
import { originalToGeneratedId, isOriginalId } from "devtools-source-map";
import { find } from "lodash";
import { prefs } from "../utils/prefs";

import { getRelativeSources } from "../selectors";

import type { Source, Location } from "../types";
import type { PendingSelectedLocation } from "./types";
import type { Action, DonePromiseAction } from "../actions/types";
import type { LoadSourceAction } from "../actions/types/SourceAction";

type Tab = string;
export type SourcesMap = { [string]: Source };
export type TabList = Tab[];

export type SourcesState = {
  sources: SourcesMap,
  pendingSelectedLocation?: PendingSelectedLocation,
  selectedLocation: ?Location,
  tabs: TabList
};

export function initialSourcesState(): SourcesState {
  return {
    sources: {},
    selectedLocation: undefined,
    pendingSelectedLocation: prefs.pendingSelectedLocation,
    tabs: restoreTabs()
  };
}

export function createSource(source: Object): Source {
  return {
    id: undefined,
    url: undefined,
    sourceMapURL: undefined,
    isBlackBoxed: false,
    isPrettyPrinted: false,
    isWasm: false,
    text: undefined,
    contentType: "",
    error: undefined,
    loadedState: "unloaded",
    ...source
  };
}

function update(
  state: SourcesState = initialSourcesState(),
  action: Action
): SourcesState {
  let location = null;

  switch (action.type) {
    case "UPDATE_SOURCE": {
      const source = action.source;
      return updateSource(state, source);
    }

    case "ADD_SOURCE": {
      const source = action.source;
      return updateSource(state, source);
    }

    case "ADD_SOURCES": {
      return action.sources.reduce(
        (newState, source) => updateSource(newState, source),
        state
      );
    }

    case "SET_SELECTED_LOCATION":
      location = {
        ...action.location,
        url: action.source.url
      };

      prefs.pendingSelectedLocation = location;

      return {
        ...state,
        selectedLocation: {
          sourceId: action.source.id,
          ...action.location
        },
        pendingSelectedLocation: location
      };

    case "CLEAR_SELECTED_LOCATION":
      location = { url: "" };
      prefs.pendingSelectedLocation = location;

      return {
        ...state,
        selectedLocation: null,
        pendingSelectedLocation: location
      };

    case "SET_PENDING_SELECTED_LOCATION":
      location = {
        url: action.url,
        line: action.line
      };

      prefs.pendingSelectedLocation = location;
      return { ...state, pendingSelectedLocation: location };

    case "ADD_TAB":
      return {
        ...state,
        tabs: updateTabList(state.tabs, action.url)
      };

    case "MOVE_TAB":
      return {
        ...state,
        tabs: updateTabList(state.tabs, action.url, action.tabIndex)
      };

    case "CLOSE_TAB":
      prefs.tabs = action.tabs;
      return { ...state, tabs: action.tabs };

    case "CLOSE_TABS":
      prefs.tabs = action.tabs;
      return { ...state, tabs: action.tabs };

    case "LOAD_SOURCE_TEXT":
      return setSourceTextProps(state, action);

    case "BLACKBOX":
      if (action.status === "done") {
        const { id, url } = action.source;
        const { isBlackBoxed } = ((action: any): DonePromiseAction).value;
        updateBlackBoxList(url, isBlackBoxed);
        return updateSource(state, { id, isBlackBoxed });
      }
      break;

    case "NAVIGATE":
      const source =
        state.selectedLocation &&
        state.sources[state.selectedLocation.sourceId];

      const url = source && source.url;

      if (!url) {
        return initialSourcesState();
      }

      return { ...initialSourcesState(), url };
  }

  return state;
}

function getTextPropsFromAction(action) {
  const { sourceId } = action;

  if (action.status === "start") {
    return { id: sourceId, loadedState: "loading" };
  } else if (action.status === "error") {
    return { id: sourceId, error: action.error, loadedState: "loaded" };
  }

  return {
    text: action.value.text,
    id: sourceId,
    contentType: action.value.contentType,
    loadedState: "loaded"
  };
}

// TODO: Action is coerced to `any` unfortunately because how we type
// asynchronous actions is wrong. The `value` may be null for the
// "start" and "error" states but we don't type it like that. We need
// to rethink how we type async actions.
function setSourceTextProps(state, action: LoadSourceAction): SourcesState {
  const text = getTextPropsFromAction(action);
  return updateSource(state, text);
}

function updateSource(state: SourcesState, source: Object) {
  if (!source.id) {
    return state;
  }

  const existingSource = state.sources[source.id];
  const updatedSource = existingSource
    ? { ...existingSource, ...source }
    : createSource(source);

  return {
    ...state,
    sources: { ...state.sources, [source.id]: updatedSource }
  };
}

export function removeSourceFromTabList(tabs: TabList, url: string): TabList {
  return tabs.filter(tab => tab !== url);
}

export function removeSourcesFromTabList(tabs: TabList, urls: TabList) {
  return urls.reduce((t, url) => removeSourceFromTabList(t, url), tabs);
}

function restoreTabs() {
  const prefsTabs = prefs.tabs || [];
  return prefsTabs;
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/sources
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

function updateBlackBoxList(url, isBlackBoxed) {
  const tabs = getBlackBoxList();
  const i = tabs.indexOf(url);
  if (i >= 0) {
    if (!isBlackBoxed) {
      tabs.splice(i, 1);
    }
  } else if (isBlackBoxed) {
    tabs.push(url);
  }
  prefs.tabsBlackBoxed = tabs;
}

export function getBlackBoxList() {
  return prefs.tabsBlackBoxed || [];
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

  const tabUrls = state.sources.tabs;
  const leftNeighborIndex = Math.max(tabUrls.indexOf(selectedTab.url) - 1, 0);
  const lastAvailbleTabIndex = availableTabs.length - 1;
  const newSelectedTabIndex = Math.min(leftNeighborIndex, lastAvailbleTabIndex);
  const availableTab = availableTabs[newSelectedTabIndex];
  const tabSource = getSourceByUrlInSources(
    state.sources.sources,
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
type OuterState = { sources: SourcesState };

const getSourcesState = (state: OuterState) => state.sources;

export function getSource(state: OuterState, id: string) {
  return getSourceInSources(getSources(state), id);
}

export function getSourceFromId(state: OuterState, id: string): Source {
  return getSourcesState(state).sources[id];
}

export function getSourceByURL(state: OuterState, url: string): ?Source {
  return getSourceByUrlInSources(state.sources.sources, url);
}

export function getGeneratedSource(state: OuterState, source: Source): Source {
  if (!isOriginalId(source.id)) {
    return source;
  }

  return getSourceFromId(state, originalToGeneratedId(source.id));
}

export function getPendingSelectedLocation(state: OuterState) {
  return state.sources.pendingSelectedLocation;
}

export function getPrettySource(state: OuterState, id: string) {
  const source = getSource(state, id);
  if (!source) {
    return;
  }

  return getSourceByURL(state, getPrettySourceURL(source.url));
}

export function hasPrettySource(state: OuterState, id: string) {
  return !!getPrettySource(state, id);
}

function getSourceByUrlInSources(sources: SourcesMap, url: string) {
  if (!url) {
    return null;
  }

  return find(sources, source => source.url === url);
}

export function getSourceInSources(sources: SourcesMap, id: string): ?Source {
  return sources[id];
}

export function getSources(state: OuterState) {
  return state.sources.sources;
}

export function getSourceList(state: OuterState): Source[] {
  return (Object.values(getSources(state)): any);
}

export function getSourceCount(state: OuterState) {
  return Object.keys(getSources(state)).length;
}

export const getTabs = createSelector(getSourcesState, sources => sources.tabs);

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
  (selectedLocation: ?Location, sources: SourcesMap): ?Source => {
    if (!selectedLocation) {
      return;
    }

    return sources[selectedLocation.sourceId];
  }
);

export function getSourceFromPrettySource(
  state: OuterState,
  baseSource: Source
): Source | null {
  if (!baseSource) {
    return null;
  }
  if (!baseSource.isPrettyPrinted) {
    return baseSource;
  }

  const sources = getRelativeSources(state);
  const id = Object.keys(sources).find(sourceId => {
    return (
      getRawSourceURL(sources[sourceId].url) === getRawSourceURL(baseSource.url)
    );
  });
  return id ? sources[id] : null;
}

export default update;
