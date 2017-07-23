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

import { loadAllSources } from "./sources";

import type { ThunkArgs } from "./types";

export function addSearchQuery(query: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "ADD_QUERY", query });
  };
}

export function removeSearchQuery() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "CLEAR_QUERY" });
  };
}

export function searchSources(query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    dispatch(await loadAllSources());
    dispatch(addSearchQuery(query));

    const sources = getSources(getState());
    const validSources = sources
      .valueSeq()
      .filter(source => source.has("text"))
      .toJS();

    for (const source of validSources) {
      const matches = await searchSource(source, query);
      dispatch({
        type: "ADD_SEARCH_RESULT",
        result: {
          sourceId: source.id,
          filepath: source.url,
          matches
        }
      });
    }
  };
}
