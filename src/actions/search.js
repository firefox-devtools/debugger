// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redux actions for the search state
 * @module actions/search
 */

import { searchSource } from "../utils/search/project-search";

import { getSources, getSearchResult } from "../selectors";

import type { ThunkArgs } from "./types";

export function searchSources(query) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    addSearchQuery(query);

    const sources = getSources(getState());
    const validSources = sources
      .valueSeq()
      .filter(source => source.has("text"))
      .toJS();

    validSources.forEach(source => {
      const result = getSearchResult(getState(), source.id);
      if (result) {
        return;
      }

      dispatch({
        type: "ADD_SEARCH_RESULT",
        result: {
          id: source.id,
          filepath: source.url,
          matches: searchSource(source, query)
        }
      });
    });
  };
}

export function addSearchQuery(query) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "ADD_QUERY", query });
  };
}

export function removeSearchQuery() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "REMOVE_QUERY", query });
  };
}
