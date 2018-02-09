/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * File Search reducer
 * @module reducers/fileSearch
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

export type FileSearchState = {
  searchResults: SearchResults,
  query: string,
  modifiers: Modifiers
};

export const createFileSearchState = makeRecord(
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
  }: FileSearchState)
);

function update(
  state: Record<FileSearchState> = createFileSearchState(),
  action: Action
): Record<FileSearchState> {
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
type OuterState = { fileSearch: Record<FileSearchState> };

export function getFileSearchQuery(state: OuterState): string {
  return state.fileSearch.get("query");
}

export function getFileSearchModifiers(state: OuterState): Modifiers {
  return state.fileSearch.get("modifiers");
}

export function getFileSearchResults(state: OuterState) {
  return state.fileSearch.get("searchResults");
}

export default update;
