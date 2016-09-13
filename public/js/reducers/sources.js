// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fromJS = require("../utils/fromJS");
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");

import type { Action, Source, SourceText } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SourcesState = {
  sources: I.Map<string, any>,
  selectedLocation?: {
    sourceId: string,
    line?: number,
    column?: number
  },
  pendingSelectedSourceURL: ?string,
  sourcesText: I.Map<string, any>,
  tabs: I.List<any>,
  sourceMaps: I.Map<string, any>,
};

const State = makeRecord(({
  sources: I.Map(),
  selectedLocation: undefined,
  pendingSelectedSourceURL: undefined,
  sourcesText: I.Map(),
  sourceMaps: I.Map(),
  tabs: I.List([])
} : SourcesState));

function update(state = State(), action: Action) : Record<SourcesState> {
  switch (action.type) {
    case "ADD_SOURCE": {
      const source: Source = action.source;
      return state.mergeIn(["sources", action.source.id], source);
    }

    case "ADD_SOURCES":
      return state.mergeIn(
        ["sources"],
        I.Map(action.sources.map(source => {
          return [source.id, fromJS(source)];
        }))
      );

    case "LOAD_SOURCE_MAP":
      if (action.status == "done") {
        return state.mergeIn(
          ["sourceMaps", action.source.id],
          action.value.sourceMap
        );
      }
      break;

    case "SELECT_SOURCE":
      return state.merge({
        pendingSelectedSourceURL: null,
        tabs: updateTabList(state, fromJS(action.source), action.tabIndex)
      }).set("selectedLocation", { sourceId: action.source.id,
                                   line: action.line });

    case "SELECT_SOURCE_URL":
      return state.merge({ pendingSelectedSourceURL: action.url });

    case "CLOSE_TAB":
      return state.merge({ tabs: removeSourceFromTabList(state, action.id) })
        .set("selectedLocation", {
          sourceId: getNewSelectedSourceId(state, action.id)
        });

    case "LOAD_SOURCE_TEXT": {
      let values;
      if (action.status === "done") {
        const { generatedSourceText, originalSourceTexts } = action.value;
        values = [generatedSourceText, ...originalSourceTexts];
      } else {
        const { source } = action;
        values = [source];
      }

      return _updateText(state, action, values);
    }

    case "BLACKBOX":
      if (action.status === "done") {
        return state.setIn(
          ["sources", action.source.id, "isBlackBoxed"],
          action.value.isBlackBoxed
        );
      }
      break;

    case "TOGGLE_PRETTY_PRINT":
      if (action.status === "done") {
        return _updateText(state, action, [action.value.sourceText])
          .setIn(
            ["sources", action.source.id, "isPrettyPrinted"],
            action.value.isPrettyPrinted
          );
      }

      return _updateText(state, action, [action.originalSource]);

    case "NAVIGATE":
      const source = getSelectedSource({ sources: state });
      const sourceUrl = source && source.get("url");
      return State()
        .set("pendingSelectedSourceURL", sourceUrl);
  }

  return state;
}

function _updateText(state, action, values) : Record<SourcesState> {
  if (action.status === "start") {
    // Merge this in, don't set it. That way the previous value is
    // still stored here, and we can retrieve it if whatever we're
    // doing fails.
    return values.reduce((_state, source: any) => {
      return _state.mergeIn(["sourcesText", source.id], {
        loading: true
      });
    }, state);
  }

  if (action.status === "error") {
    return values.reduce((_state, source: any) => {
      return _state.setIn(["sourcesText", source.id], I.Map({
        error: action.error
      }));
    }, state);
  }

  return values.reduce((_state, sourceText: SourceText) => {
    return _state.setIn(["sourcesText", sourceText.id], I.Map({
      text: sourceText.text,
      contentType: sourceText.contentType
    }));
  }, state);
}

function removeSourceFromTabList(state, id) {
  return state.tabs.filter(tab => tab.get("id") != id);
}

/*
 * Adds the new source to the tab list if it is not already there
 */
function updateTabList(state, source, tabIndex) {
  const tabs = state.get("tabs");
  const selectedSource = getSelectedSource({ sources: state });
  const selectedSourceIndex = tabs.indexOf(selectedSource);
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

  return tabs.insert(selectedSourceIndex + 1, source);
}

/**
 * Gets the next tab to select when a tab closes.
 */
function getNewSelectedSourceId(state, id) : ?Source {
  const tabs = state.get("tabs");
  const selectedSource = getSelectedSource({ sources: state });

  // if we're not closing the selected tab return the selected tab
  if (selectedSource.get("id") != id) {
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
// the state that we care about and still type if with Flow. The
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
  return state.sources.selectedLocation &&
    getSource(state, state.sources.selectedLocation.sourceId);
}

function getSelectedLocation(state: OuterState) {
  return state.sources.selectedLocation;
}

function getPendingSelectedSourceURL(state: OuterState) {
  return state.sources.pendingSelectedSourceURL;
}

function getSourceMap(state: OuterState, sourceId: string) {
  return state.sources.sourceMaps.get(sourceId);
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
  getPendingSelectedSourceURL,
  getSourceMap,
  getPrettySource
};
