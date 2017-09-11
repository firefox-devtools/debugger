// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type Modifiers = Record<{
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
}>;

export type MatchedLocations = {
  line: number,
  ch: number
};

export type SearchResults = {
  matches: Array<MatchedLocations>,
  matchIndex: number,
  index: number,
  count: number
};

export type UIState = {
  searchResults: SearchResults,
  query: string,
  modifiers: Modifiers
};

export const State = makeRecord(
  ({
    query: "",
    searchResults: {
      matches: [],
      matchIndex: -1,
      index: -1,
      count: 0
    },
    modifiers: makeRecord({
      caseSensitive: prefs.fileSearchCaseSensitive,
      wholeWord: prefs.fileSearchWholeWord,
      regexMatch: prefs.fileSearchRegexMatch
    })()
  }: UIState)
);

function update(
  state: Record<UIState> = State(),
  action: Action
): Record<UIState> {
  switch (action.type) {
    case "UPDATE_FILE_SEARCH_QUERY": {
      return state.set("query", action.query);
    }

    case "UPDATE_SEARCH_RESULTS": {
      return state.set("searchResults", action.results);
    }

    case "TOGGLE_FILE_SEARCH_MODIFIER": {
      const actionVal = !state.getIn(["modifiers", action.modifier]);

      if (action.modifier == "caseSensitive") {
        prefs.fileSearchCaseSensitive = actionVal;
      }

      if (action.modifier == "wholeWord") {
        prefs.fileSearchWholeWord = actionVal;
      }

      if (action.modifier == "regexMatch") {
        prefs.fileSearchRegexMatch = actionVal;
      }

      return state.setIn(["modifiers", action.modifier], actionVal);
    }

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { fileSearch: Record<UIState> };

export function getFileSearchQuery(state: OuterState): string {
  return state.fileSearch.get("query");
}

export function getFileSearchModifiers(state: OuterState): Modifiers {
  return state.fileSearch.get("modifiers");
}

export function getSearchResults(state: OuterState) {
  return state.fileSearch.get("searchResults");
}

export default update;
