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

export type SearchResults = {
  index: number,
  count: number
};

export type UIState = {
  fileSearchOn: boolean,
  fileSearchQuery: string,
  fileSearchModifiers: FileSearchModifiers,
  projectSearchOn: boolean,
  symbolSearchOn: boolean,
  symbolSearchType: SymbolSearchType,
  searchResults: SearchResults,
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
    fileSearchOn: false,
    fileSearchQuery: "",
    fileSearchModifiers: makeRecord({
      caseSensitive: prefs.fileSearchCaseSensitive,
      wholeWord: prefs.fileSearchWholeWord,
      regexMatch: prefs.fileSearchRegexMatch
    })(),
    projectSearchOn: false,
    symbolSearchOn: false,
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
    case "TOGGLE_PROJECT_SEARCH": {
      return state.set("projectSearchOn", action.value);
    }

    case "TOGGLE_FRAMEWORK_GROUPING": {
      prefs.frameworkGroupingOn = action.value;
      return state.set("frameworkGroupingOn", action.value);
    }

    case "TOGGLE_FILE_SEARCH": {
      return state.set("fileSearchOn", action.value);
    }

    case "TOGGLE_SYMBOL_SEARCH": {
      return state.set("symbolSearchOn", action.value);
    }

    case "UPDATE_FILE_SEARCH_QUERY": {
      return state.set("fileSearchQuery", action.query);
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

type SearchFieldType = "projectSearchOn" | "fileSearchOn" | "symbolSearchOn";
function getSearchState(field: SearchFieldType, state: OuterState): boolean {
  return state.ui.get(field);
}

export function getFileSearchQueryState(state: OuterState): string {
  return state.ui.get("fileSearchQuery");
}

export function getFileSearchModifierState(
  state: OuterState
): FileSearchModifiers {
  return state.ui.get("fileSearchModifiers");
}

export function getSymbolSearchResults(state: OuterState): string {
  return state.ui.get("symbolSearchResults");
}

export function getSearchResults(state: OuterState): string {
  return state.ui.get("searchResults");
}

export function getFrameworkGroupingState(state: OuterState): boolean {
  return state.ui.get("frameworkGroupingOn");
}

export function getSymbolSearchType(state: OuterState): SymbolSearchType {
  return state.ui.get("symbolSearchType");
}

export const getProjectSearchState = getSearchState.bind(
  null,
  "projectSearchOn"
);
export const getFileSearchState = getSearchState.bind(null, "fileSearchOn");
export const getSymbolSearchState = getSearchState.bind(null, "symbolSearchOn");

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
