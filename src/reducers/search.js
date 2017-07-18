// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Search reducer
 * @module reducers/search
 */

import * as I from "immutable";
import { prefs } from "../utils/prefs";
import makeRecord from "../utils/makeRecord";

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";
import type { Map } from "immutable";

type Search = {
  id: string,
  filepath: string,
  matches: I.List
};
type ResultRecord = Record<Search>;
type ResultMap = Map<string, ResultRecord>;
export type SearchState = {
  query: string,
  results: ResultMap
};

export function InitialState(): Record {
  return makeRecord(({ query: undefined, results: I.Map() }: SearchState))();
}

function update(
  state: Record<SearchState> = InitialState(),
  action: Action
): Record {
  switch (action.type) {
    case "ADD_QUERY":
      return state.update("query", value => action.query);

    case "REMOVE_QUERY":
      return state.remove("query");

    case "ADD_SEARCH_RESULT":
      return state.updateIn(
        ["results", action.result.id],
        value => action.result
      );
  }
  return state;
}

type OuterState = { search: Record<SearchState> };

export function getSearchResults(state: OuterState) {
  return state.search.get("results").valueSeq().toJS();
}

export function getSearchResult(state: OuterState, id) {
  return state.search.getIn(["results", id]);
}

export default update;
