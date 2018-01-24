/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the search state
 * @module actions/search
 */

import { findSourceMatches } from "../workers/search";
import { getSources, getSource, hasPrettySource } from "../selectors";
import { isThirdParty } from "../utils/source";
import { loadSourceText } from "./sources";
import { statusType } from "../reducers/project-text-search";

import type { ThunkArgs } from "./types";

export function addSearchQuery(query: string) {
  return { type: "ADD_QUERY", query };
}

export function clearSearchQuery() {
  return { type: "CLEAR_QUERY" };
}

export function clearSearchResults() {
  return { type: "CLEAR_SEARCH_RESULTS" };
}

export function clearSearch() {
  return { type: "CLEAR_SEARCH" };
}

export function updateSearchStatus(status: string) {
  return { type: "UPDATE_STATUS", status };
}

export function closeProjectSearch() {
  return { type: "CLOSE_PROJECT_SEARCH" };
}

export function searchSources(query: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    await dispatch(clearSearchResults());
    await dispatch(addSearchQuery(query));
    dispatch(updateSearchStatus(statusType.fetching));
    const sources = getSources(getState());
    const validSources = sources
      .valueSeq()
      .filter(
        source =>
          !hasPrettySource(getState(), source.get("id")) &&
          !isThirdParty(source)
      );
    for (const source of validSources) {
      await dispatch(loadSourceText(source));
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
    if (!matches.length) {
      return;
    }
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
