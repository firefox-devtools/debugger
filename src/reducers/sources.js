// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Sources reducer
 * @module reducers/sources
 */

const I = require("immutable");
const makeRecord = require("../utils/makeRecord");
const { getPrettySourceURL } = require("../utils/source");
const { prefs } = require("../utils/prefs");

import type { Source, Location } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SourcesState = {
  sources: I.Map<string, any>,
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
  sourcesText: I.Map<string, any>,
  tabs: I.List<any>
};

const State = makeRecord(({
  sources: I.Map(),
  selectedLocation: undefined,
  pendingSelectedLocation: prefs.pendingSelectedLocation,
  sourcesText: I.Map(),
  tabs: I.List(restoreTabs())
} : SourcesState));

function update(state = State(), action: Action) : Record<SourcesState> {
  let availableTabs = null;
  let location = null;

  switch (action.type) {
    case "ADD_SOURCE": {
      const source: Source = action.source;
      return state.mergeIn(["sources", action.source.id], source);
    }

    case "SELECT_SOURCE":
      location = {
        line: action.line,
        url: action.source.url
      };
      prefs.pendingSelectedLocation = location;

      const sourceUrl = action.source.url || "";
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

      return state.merge({ tabs: availableTabs })
        .set("selectedLocation", {
          sourceId: getNewSelectedSourceId(state, availableTabs)
        });

    case "CLOSE_TABS":
      availableTabs = removeSourcesFromTabList(state.tabs, action.urls);

      return state.merge({ tabs: availableTabs })
        .set("selectedLocation", {
          sourceId: getNewSelectedSourceId(state, availableTabs)
        });

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
      return State()
        .set("pendingSelectedLocation", { url });
  }

  return state;
}

// TODO: Action is coerced to `any` unfortunately because how we type
// asynchronous actions is wrong. The `value` may be null for the
// "start" and "error" states but we don't type it like that. We need
// to rethink how we type async actions.
function _updateText(state, action : any) : Record<SourcesState> {
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
    return state.setIn(["sourcesText", source.id], I.Map({
      error: action.error
    }));
  }

  return state.setIn(["sourcesText", source.id], I.Map({
    text: sourceText.text,
    contentType: sourceText.contentType
  }));
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
  if (Object.keys(prefsTabs).length == 0) {
    return;
  }

  return prefsTabs;
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(
  state: OuterState, url: string, tabIndex?: number) {
  let tabs = state.sources.get("tabs");

  const urlIndex = tabs.indexOf(url);
  const includesUrl = !!tabs.find(tab => tab == url);

  if (includesUrl) {
    if (tabIndex != undefined) {
      tabs = tabs
        .delete(urlIndex)
        .insert(tabIndex, url);
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
function getNewSelectedSourceId(state: SourcesState, availableTabs) : string {
  const selectedLocation = state.selectedLocation;
  if (!selectedLocation) {
    return "";
  }

  const selectedTab = state.sources.find(
    source => source.get("id") == selectedLocation.sourceId
  );

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
  let tabSource = state.sources.find(source =>
    source.get("url") == availableTabs.toJS()[newSelectedTabIndex]);

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

function getSource(state: OuterState, id: string) {
  return state.sources.sources.get(id);
}

function getSourceByURL(state: OuterState, url: string) {
  return state.sources.sources.find(source => source.get("url") == url);
}

function getSourceById(state: OuterState, id: string) {
  return state.sources.sources.find(source => source.get("id") == id);
}

function getSources(state: OuterState) {
  return state.sources.sources;
}

function getSourceText(state: OuterState, id: string) {
  return state.sources.sourcesText.get(id);
}

function getSourceTabs(state: OuterState) {
  const selectedLocation = getSelectedLocation(state);
  if (!selectedLocation) {
    return new I.List([]);
  }

  return state.sources.tabs
    .filter(tab => getSourceByURL(state, tab));
}

function getSelectedSource(state: OuterState) {
  const selectedLocation = state.sources.selectedLocation;
  if (!selectedLocation) {
    return;
  }

  return state.sources.sources.find(source =>
    source.get("id") == selectedLocation.sourceId
  );
}

function getSelectedLocation(state: OuterState) {
  return state.sources.selectedLocation;
}

function getPendingSelectedLocation(state: OuterState) {
  return state.sources.pendingSelectedLocation;
}

function getPrettySource(state: OuterState, id: string) {
  const source = getSource(state, id);
  if (!source) {
    return;
  }

  return getSourceByURL(state, getPrettySourceURL(source.get("url")));
}

module.exports = {
  State,
  update,
  getSource,
  getSourceByURL,
  getSourceById,
  getSources,
  getSourceText,
  getSourceTabs,
  getSelectedSource,
  getSelectedLocation,
  getPendingSelectedLocation,
  getPrettySource
};
