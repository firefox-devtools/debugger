// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Sources reducer
 * @module reducers/sources
 */

const fromJS = require("../utils/fromJS");
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");

import type { Source } from "../types";
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
  sourcesText: I.Map<string, any>,
  tabs: I.List<any>
};

const State = makeRecord(({
  sources: I.Map(),
  selectedLocation: undefined,
  pendingSelectedLocation: undefined,
  sourcesText: I.Map(),
  tabs: I.List([])
} : SourcesState));

function update(state = State(), action: Action) : Record<SourcesState> {
  switch (action.type) {
    case "ADD_SOURCE": {
      const source: Source = action.source;
      return state.mergeIn(["sources", action.source.id], source);
    }

    case "SELECT_SOURCE":
      return state
        .set("selectedLocation", {
          sourceId: action.source.id,
          line: action.line
        })
        .set("pendingSelectedLocation", null)
        .merge({
          tabs: updateTabList(state, fromJS(action.source), action.tabIndex)
        });

    case "SELECT_SOURCE_URL":
      return state.set("pendingSelectedLocation", {
        url: action.url,
        line: action.line
      });

    case "CLOSE_TAB":
      return state.merge({ tabs: removeSourceFromTabList(state, action.id) })
        .set("selectedLocation", {
          sourceId: getNewSelectedSourceId(state, action.id)
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

function removeSourceFromTabList(state, id) {
  return state.tabs.filter(tab => tab.get("id") != id);
}

/**
 * Adds the new source to the tab list if it is not already there
 * @memberof reducers/sources
 * @static
 */
function updateTabList(state, source, tabIndex) {
  const tabs = state.get("tabs");
  const sourceIndex = tabs.indexOf(source);
  const includesSource = !!tabs.find((t) => t.get("id") == source.get("id"));

  if (includesSource) {
    if (tabIndex != undefined) {
      return tabs
        .delete(sourceIndex)
        .insert(tabIndex, source);
    }

    return tabs;
  }

  return tabs.insert(0, source);
}

/**
 * Gets the next tab to select when a tab closes.
 * @memberof reducers/sources
 * @static
 */
function getNewSelectedSourceId(state, id) : ?Source {
  const tabs = state.get("tabs");
  const selectedSource = getSelectedSource({ sources: state });

  if (!selectedSource) {
    return undefined;
  } else if (selectedSource.get("id") != id) {
    // If we're not closing the selected tab return the selected tab
    return selectedSource.get("id");
  }

  const tabIndex = tabs.findIndex(tab => tab.get("id") == id);
  const numTabs = tabs.count();

  if (numTabs == 1) {
    return undefined;
  }

  // if we're closing the last tab, select the penultimate tab
  if (tabIndex + 1 == numTabs) {
    return tabs.get(tabIndex - 1).get("id");
  }

  // return the next tab
  return tabs.get(tabIndex + 1).get("id");
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
  return state.sources.tabs;
}

function getSelectedSource(state: OuterState) {
  if (state.sources.selectedLocation) {
    return getSource(state, state.sources.selectedLocation.sourceId);
  }
  return undefined;
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

  return getSourceByURL(state, source.get("url") + ":formatted");
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
