/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Sources reducer
 * @module reducers/sources
 */

import * as I from "immutable";
import { createSelector } from "reselect";
import makeRecord from "../utils/makeRecord";
import { getPrettySourceURL } from "../utils/source";
import { originalToGeneratedId, isOriginalId } from "devtools-source-map";
import { prefs } from "../utils/prefs";

import type { Map, List } from "immutable";
import type { Source, Location } from "../types";
import type { SelectedLocation, PendingSelectedLocation } from "./types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type Tab = string;
export type SourceRecord = Record<Source>;
export type SourcesMap = Map<string, SourceRecord>;
type TabList = List<Tab>;

export type SourcesState = {
  sources: SourcesMap,
  selectedLocation?: SelectedLocation,
  pendingSelectedLocation?: PendingSelectedLocation,
  selectedLocation?: Location,
  tabs: TabList
};

export function initialSourcesState(): Record<SourcesState> {
  return makeRecord(
    ({
      sources: I.Map(),
      selectedLocation: undefined,
      pendingSelectedLocation: prefs.pendingSelectedLocation,
      sourcesText: I.Map(),
      tabs: I.List(restoreTabs())
    }: SourcesState)
  )();
}

export const SourceRecordClass = new I.Record({
  id: undefined,
  url: undefined,
  sourceMapURL: undefined,
  isBlackBoxed: false,
  isPrettyPrinted: false,
  isWasm: false,
  text: undefined,
  contentType: "",
  error: undefined,
  loadedState: "unloaded"
});

function update(
  state: Record<SourcesState> = initialSourcesState(),
  action: Action
): Record<SourcesState> {
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

    case "SELECT_SOURCE":
      location = {
        ...action.location,
        url: action.source.url
      };

      prefs.pendingSelectedLocation = location;
      return state
        .set("selectedLocation", {
          sourceId: action.source.id,
          ...action.location
        })
        .set("pendingSelectedLocation", location);

    case "CLEAR_SELECTED_SOURCE":
      location = { url: "" };
      prefs.pendingSelectedLocation = location;

      return state
        .set("selectedLocation", { sourceId: "" })
        .set("pendingSelectedLocation", location);

    case "SELECT_SOURCE_URL":
      location = {
        url: action.url,
        line: action.line
      };

      prefs.pendingSelectedLocation = location;
      return state.set("pendingSelectedLocation", location);

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

    case "LOAD_SOURCE_TEXT":
      return setSourceTextProps(state, action);

    case "BLACKBOX":
      if (action.status === "done") {
        const url = action.source.url;
        const isBlackBoxed = action.value.isBlackBoxed;
        updateBlackBoxList(url, isBlackBoxed);
        return state.setIn(
          ["sources", action.source.id, "isBlackBoxed"],
          isBlackBoxed
        );
      }
      break;

    case "NAVIGATE":
      const source = getSelectedSource({ sources: state });
      const url = source && source.url;

      if (!url) {
        return initialSourcesState();
      }

      return initialSourcesState().set("pendingSelectedLocation", { url });
  }

  return state;
}

function getTextPropsFromAction(action: any) {
  const { value, sourceId } = action;

  if (action.status === "start") {
    return { id: sourceId, loadedState: "loading" };
  } else if (action.status === "error") {
    return { id: sourceId, error: action.error, loadedState: "loaded" };
  }
  return {
    text: value.text,
    id: sourceId,
    contentType: value.contentType,
    loadedState: "loaded"
  };
}

// TODO: Action is coerced to `any` unfortunately because how we type
// asynchronous actions is wrong. The `value` may be null for the
// "start" and "error" states but we don't type it like that. We need
// to rethink how we type async actions.
function setSourceTextProps(state, action: any): Record<SourcesState> {
  const text = getTextPropsFromAction(action);
  return updateSource(state, text);
}

function updateSource(state: Record<SourcesState>, source: Source | Object) {
  if (!source.id) {
    return state;
  }
  const existingSource = state.getIn(["sources", source.id]);

  if (existingSource) {
    const updatedSource = existingSource.merge(source);
    return state.setIn(["sources", source.id], updatedSource);
  }
  return state.setIn(["sources", source.id], new SourceRecordClass(source));
}

export function removeSourceFromTabList(tabs: any, url: string) {
  return tabs.filter(tab => tab != url);
}

export function removeSourcesFromTabList(tabs: any, urls: Array<string>) {
  return urls.reduce((t, url) => removeSourceFromTabList(t, url), tabs);
}

function restoreTabs() {
  const prefsTabs = prefs.tabs || [];
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
  let tabs = state.sources.tabs;

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
  availableTabs: any
): string {
  const selectedLocation = state.sources.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  const selectedTab = state.sources.sources.get(selectedLocation.sourceId);

  const selectedTabUrl = selectedTab ? selectedTab.url : "";

  if (availableTabs.includes(selectedTabUrl)) {
    const sources = state.sources.sources;
    if (!sources) {
      return "";
    }

    const selectedSource = sources.find(source => source.url == selectedTabUrl);

    if (selectedSource) {
      return selectedSource.id;
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
type OuterState = { sources: Record<SourcesState> };

const getSourcesState = state => state.sources;

export function getSource(state: OuterState, id: string) {
  return getSourceInSources(getSources(state), id);
}

export function getSourceByURL(state: OuterState, url: string): ?SourceRecord {
  return getSourceByUrlInSources(state.sources.sources, url);
}

export function getGeneratedSource(state: OuterState, source: ?Source) {
  if (!source || !isOriginalId(source.id)) {
    return null;
  }
  return getSource(state, originalToGeneratedId(source.id));
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

  return sources.find(source => source.url === url);
}

export function getSourceInSources(
  sources: SourcesMap,
  id: string
): SourceRecord {
  return sources.get(id);
}

export const getSources = createSelector(
  getSourcesState,
  sources => sources.sources
);

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
  (selectedLocation, sources) => {
    if (!selectedLocation) {
      return;
    }

    return sources.get(selectedLocation.sourceId);
  }
);

export const getSelectedSourceText = createSelector(
  getSelectedSource,
  getSourcesState,
  (selectedSource, sources) => {
    const id = selectedSource.id;
    return id ? sources.sourcesText.get(id) : null;
  }
);

export default update;
