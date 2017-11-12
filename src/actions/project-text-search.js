/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the search state
 * @module actions/search
 */

import { findSourceMatches } from "../workers/search";
import { getSources, getSource } from "../selectors";
import { isThirdParty, isLoaded } from "../utils/source";
import { loadAllSources } from "./sources";

import type { ThunkArgs } from "./types";

export function addSearchQuery(query: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "ADD_QUERY", query });
  };
}

export function clearSearchQuery() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "CLEAR_QUERY" });
  };
}

export function clearSearchResults() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "CLEAR_SEARCH_RESULTS" });
  };
}

export function searchSources(query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    await dispatch(clearSearchResults());
    await dispatch(addSearchQuery(query));
    await dispatch(loadAllSources());
    const sources = getSources(getState());
    const validSources = sources
      .valueSeq()
      .filter(source => isLoaded(source.toJS()) && !isThirdParty(source.toJS()))
      .toJS();

    for (const source of validSources) {
      await dispatch(searchSource(source.id, query));
    }
  };
}

export function searchSource(sourceId: string, query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (!sourceRecord) {
      return;
    }

    const source = sourceRecord.toJS();
    const matches = await findSourceMatches(source, query);
    dispatch({
      type: "ADD_SEARCH_RESULT",
      result: {
        sourceId: source.id,
        filepath: source.url,
        matches
      }
    });
  };
}
