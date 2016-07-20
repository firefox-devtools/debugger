// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fromJS = require("../util/fromJS");
const I = require("immutable");

import type { Action, Source } from "../actions/types";

export type SourcesState = {
  sources: I.Map<string, any>,
  selectedSource: ?any,
  sourcesText: I.Map<string, any>,
  tabs: I.List<any>,
  sourceMaps: I.Map<string, any>,
};

const State = I.Record({
  sources: I.Map({}),
  selectedSource: undefined,
  sourcesText: I.Map({}),
  sourceMaps: I.Map({}),
  tabs: I.List([])
});

function update(state = State(), action: Action) {
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
        selectedSource: action.source,
        tabs: updateTabList(state, fromJS(action.source), action.options)
      });

    case "CLOSE_TAB":
      return state.merge({
        selectedSource: getNewSelectedSource(state, action.id),
        tabs: removeSourceFromTabList(state, action.id)
      });

    case "LOAD_SOURCE_TEXT": {
      let values;
      if (action.done) {
        const { generatedSourceText, originalSourceTexts } = action.value;
        values = [generatedSourceText, ...originalSourceTexts];
      } else {
        const { generatedSource, originalSources } = action;
        values = [generatedSource, ...originalSources];
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
      if (action.status === "error") {
        return state.mergeIn(["sourcesText", action.source.id], {
          loading: false
        });
      }

      let s = _updateText(state, action, [action.source]);
      if (action.status === "done") {
        s = s.setIn(
          ["sources", action.source.id, "isPrettyPrinted"],
          action.value.isPrettyPrinted
        );
      }
      return s;

    case "NAVIGATE":
      // Reset the entire state to just the initial state, a blank state
      // if you will.
      return State();
  }

  return state;
}

function _updateText(state, action, values) {
  if (action.status === "start") {
    // Merge this in, don't set it. That way the previous value is
    // still stored here, and we can retrieve it if whatever we're
    // doing fails.
    return values.reduce((_state, source) => {
      return _state.mergeIn(["sourcesText", source.id], {
        loading: true
      });
    }, state);
  }

  if (action.status === "error") {
    return values.reduce((_state, source) => {
      return _state.setIn(["sourcesText", source.id], {
        error: action.error
      });
    }, state);
  }

  return values.reduce((_state, sourceText) => {
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
function updateTabList(state, source, options) {
  const tabs = state.get("tabs");
  const selectedSource = state.get("selectedSource");
  const selectedSourceIndex = tabs.indexOf(selectedSource);
  const sourceIndex = tabs.indexOf(source);
  const includesSource = !!tabs.find((t) => t.get("id") == source.get("id"));

  if (includesSource) {
    if (options.position != undefined) {
      return tabs
        .delete(sourceIndex)
        .insert(options.position, source);
    }

    return tabs;
  }

  return tabs.insert(selectedSourceIndex + 1, source);
}

/**
 * Gets the next tab to select when a tab closes.
 */
function getNewSelectedSource(state, id) : ?Source {
  const tabs = state.get("tabs");
  const selectedSource = state.get("selectedSource");

  // if we're not closing the selected tab return the selected tab
  if (selectedSource.get("id") != id) {
    return selectedSource;
  }

  const tabIndex = tabs.findIndex(tab => tab.get("id") == id);
  const numTabs = tabs.count();

  if (numTabs == 1) {
    return undefined;
  }

  // if we're closing the last tab, select the penultimate tab
  if (tabIndex + 1 == numTabs) {
    return tabs.get(tabIndex - 1);
  }

  // return the next tab
  return tabs.get(tabIndex + 1);
}

// We need this for tests, but I also think we should start bundling
// in selectors into reducer modules, so we'll eventually start
// exporting multiple things from here. Need to flesh out this idea.
update.SourcesState = State;

module.exports = update;
