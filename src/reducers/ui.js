// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { Action, panelPositionType } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type FileSearchModifiers = Record<{
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
}>;

export type SymbolSearchType = "functions" | "variables";
export type ActiveSearchType = "project" | "file" | "symbol";

export type SearchResults = {
  index: number,
  count: number
};

export type UIState = {
  activeSearch: ?ActiveSearchType,
  fileSearchQuery: string,
  fileSearchModifiers: FileSearchModifiers,
  symbolSearchQuery: string,
  symbolSearchType: SymbolSearchType,
  searchResults: SearchResults,
  symbolSearchResults: Array<*>,
  shownSource: string,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean,
  frameworkGroupingOn: boolean,
  highlightedLineRange?: {
    start?: number,
    end?: number,
    sourceId?: number
  }
};

export const State = makeRecord(
  ({
    activeSearch: null,
    fileSearchQuery: "",
    fileSearchModifiers: makeRecord({
      caseSensitive: prefs.fileSearchCaseSensitive,
      wholeWord: prefs.fileSearchWholeWord,
      regexMatch: prefs.fileSearchRegexMatch
    })(),
    symbolSearchQuery: "",
    symbolSearchType: "functions",
    symbolSearchResults: [],
    searchResults: {
      index: -1,
      count: 0
    },
    shownSource: "",
    startPanelCollapsed: prefs.startPanelCollapsed,
    endPanelCollapsed: prefs.endPanelCollapsed,
    frameworkGroupingOn: prefs.frameworkGroupingOn,
    highlightedLineRange: undefined
  }: UIState)
);

function update(
  state: Record<UIState> = State(),
  action: Action
): Record<UIState> {
  switch (action.type) {
    case "TOGGLE_ACTIVE_SEARCH": {
      return state.set("activeSearch", action.value);
    }

    case "TOGGLE_FRAMEWORK_GROUPING": {
      prefs.frameworkGroupingOn = action.value;
      return state.set("frameworkGroupingOn", action.value);
    }

    case "UPDATE_FILE_SEARCH_QUERY": {
      return state.set("fileSearchQuery", action.query);
    }

    case "UPDATE_SEARCH_RESULTS": {
      return state.set("searchResults", action.results);
    }

    case "UPDATE_SYMBOL_SEARCH_RESULTS": {
      return state.set("symbolSearchResults", action.results);
    }

    case "TOGGLE_FILE_SEARCH_MODIFIER": {
      const actionVal = !state.getIn(["fileSearchModifiers", action.modifier]);

      if (action.modifier == "caseSensitive") {
        prefs.fileSearchCaseSensitive = actionVal;
      }

      if (action.modifier == "wholeWord") {
        prefs.fileSearchWholeWord = actionVal;
      }

      if (action.modifier == "regexMatch") {
        prefs.fileSearchRegexMatch = actionVal;
      }

      return state.setIn(["fileSearchModifiers", action.modifier], actionVal);
    }

    case "UPDATE_SYMBOL_SEARCH_QUERY": {
      return state.set("symbolSearchQuery", action.query);
    }

    case "SET_SYMBOL_SEARCH_TYPE": {
      return state.set("symbolSearchType", action.symbolType);
    }

    case "SHOW_SOURCE": {
      return state.set("shownSource", action.sourceUrl);
    }

    case "TOGGLE_PANE": {
      if (action.position == "start") {
        prefs.startPanelCollapsed = action.paneCollapsed;
        return state.set("startPanelCollapsed", action.paneCollapsed);
      }

      prefs.endPanelCollapsed = action.paneCollapsed;
      return state.set("endPanelCollapsed", action.paneCollapsed);
    }

    case "HIGHLIGHT_LINES":
      const { start, end, sourceId } = action.location;
      let lineRange = {};

      if (start && end && sourceId) {
        lineRange = { start, end, sourceId };
      }

      return state.set("highlightedLineRange", lineRange);

    case "CLEAR_HIGHLIGHT_LINES":
      return state.set("highlightedLineRange", {});

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ui: Record<UIState> };

export function getActiveSearchState(state: OuterState) {
  return state.ui.get("activeSearch");
}

export function getFileSearchQueryState(state: OuterState): string {
  return state.ui.get("fileSearchQuery");
}

export function getFileSearchModifierState(
  state: OuterState
): FileSearchModifiers {
  return state.ui.get("fileSearchModifiers");
}

export function getSymbolSearchQueryState(state: OuterState): string {
  return state.ui.get("symbolSearchQuery");
}

export function getSymbolSearchResults(state: OuterState) {
  return state.ui.get("symbolSearchResults");
}

export function getSearchResults(state: OuterState) {
  return state.ui.get("searchResults");
}

export function getFrameworkGroupingState(state: OuterState): boolean {
  return state.ui.get("frameworkGroupingOn");
}

export function getSymbolSearchType(state: OuterState): SymbolSearchType {
  return state.ui.get("symbolSearchType");
}

export function getShownSource(state: OuterState): boolean {
  return state.ui.get("shownSource");
}

export function getPaneCollapse(
  state: OuterState,
  position: panelPositionType
): boolean {
  if (position == "start") {
    return state.ui.get("startPanelCollapsed");
  }

  return state.ui.get("endPanelCollapsed");
}

export function getHighlightedLineRange(state: OuterState) {
  return state.ui.get("highlightedLineRange");
}

export default update;
