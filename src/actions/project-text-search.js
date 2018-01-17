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
import { statusType } from "../reducers/project-text-search";

import type { ThunkArgs } from "./types";

export function addSearchQuery(query: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "ADD_QUERY", query });
  };
}

export function clearSearchQuery() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "CLEAR_QUERY" });
    dispatch(updateSearchStatus(statusType.initial));
  };
}

export function clearSearchResults() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({ type: "CLEAR_SEARCH_RESULTS" });
  };
}

export function clearSearch() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch(clearSearchQuery());
    dispatch(clearSearchResults());
  };
}

export function updateSearchStatus(status: string) {
  return { type: "UPDATE_STATUS", status };
}

export function closeProjectSearch() {
  return { type: "CLOSE_PROJECT_SEARCH" };
}

export function searchSources(query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (!query) {
      return;
    }
    await dispatch(clearSearchResults());
    await dispatch(addSearchQuery(query));
    dispatch(updateSearchStatus(statusType.fetching));
    await dispatch(loadAllSources());
    const sources = getSources(getState());
    const validSources = sources
      .valueSeq()
      .filter(source => isLoaded(source) && !isThirdParty(source));
    for (const source of validSources) {
      await dispatch(searchSource(source.get("id"), query));
    }
    dispatch(updateSearchStatus(statusType.done));
  };
}

export function searchSource(sourceId: string, query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (!sourceRecord) {
      return;
    }

    const matches = await findSourceMatches(sourceRecord.toJS(), query);
    dispatch({
      type: "ADD_SEARCH_RESULT",
      result: {
        sourceId: sourceRecord.get("id"),
        filepath: sourceRecord.get("url"),
        matches
      }
    });
  };
}
