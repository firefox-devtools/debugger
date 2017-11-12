/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Project text search reducer
 * @module reducers/project-text-search
 */

import * as I from "immutable";
import makeRecord from "../utils/makeRecord";

import type { ProjectTextSearchAction } from "../actions/types";
import type { Record } from "../utils/makeRecord";
import type { List } from "immutable";

export type Search = {
  id: string,
  filepath: string,
  matches: I.List<any>
};

export type ResultRecord = Record<Search>;
export type ResultList = List<ResultRecord>;
export type ProjectTextSearchState = {
  query: string,
  results: ResultList
};

export function InitialState(): Record<ProjectTextSearchState> {
  return makeRecord(
    ({ query: "", results: I.List() }: ProjectTextSearchState)
  )();
}

function update(
  state: Record<ProjectTextSearchState> = InitialState(),
  action: ProjectTextSearchAction
): Record<ProjectTextSearchState> {
  switch (action.type) {
    case "ADD_QUERY":
      return state.update("query", value => action.query);

    case "CLEAR_QUERY":
      return state.remove("query");

    case "ADD_SEARCH_RESULT":
      const results = state.get("results");
      return state.merge({ results: results.push(action.result) });

    case "CLEAR_SEARCH_RESULTS":
      return state.merge({
        results: state.get("results").clear()
      });
  }
  return state;
}

type OuterState = { projectTextSearch: Record<ProjectTextSearchState> };

export function getTextSearchResults(state: OuterState) {
  return state.projectTextSearch.get("results");
}

export function getTextSearchQuery(state: OuterState) {
  return state.projectTextSearch.get("query");
}

export default update;
