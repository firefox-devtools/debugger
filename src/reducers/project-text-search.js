/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
// @format

/**
 * Project text search reducer
 * @module reducers/project-text-search
 */

import * as I from "immutable";

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";
import type { List } from "immutable";

export type Search = {
  id: string,
  filepath: string,
  matches: I.List<any>
};
export type StatusType = "INITIAL" | "FETCHING" | "DONE" | "ERROR";
export const statusType = {
  initial: "INITIAL",
  fetching: "FETCHING",
  done: "DONE",
  error: "ERROR"
};

export type ResultRecord = Record<Search>;
export type ResultList = List<ResultRecord>;
export type ProjectTextSearchState = {
  query: string,
  results: ResultList,
  status: string
};

export function initialProjectTextSearchState(): ProjectTextSearchState {
  return {
    query: "",
    results: [],
    status: statusType.initial
  };
}

function update(
  state: ProjectTextSearchState = initialProjectTextSearchState(),
  action: Action
): ProjectTextSearchState {
  switch (action.type) {
    case "ADD_QUERY":
      return { ...state, query: action.query };

    case "CLEAR_QUERY":
      return {
        ...state,
        query: "",
        status: statusType.initial
      };

    case "ADD_SEARCH_RESULT":
      const results = state.results;
      if (action.result.matches.length === 0) {
        return state;
      }

      const result = {
        type: "RESULT",
        ...action.result,
        matches: action.result.matches.map(m => ({ type: "MATCH", ...m }))
      };
      return { ...state, results: [...results, result] };

    case "UPDATE_STATUS":
      return { ...state, status: action.status };

    case "CLEAR_SEARCH_RESULTS":
      return { ...state, results: [] };

    case "CLEAR_SEARCH":
    case "CLOSE_PROJECT_SEARCH":
    case "NAVIGATE":
      return initialProjectTextSearchState();
  }
  return state;
}

type OuterState = { projectTextSearch: ProjectTextSearchState };

export function getTextSearchResults(state: OuterState) {
  return state.projectTextSearch.results;
}

export function getTextSearchStatus(state: OuterState) {
  return state.projectTextSearch.status;
}

export function getTextSearchQuery(state: OuterState) {
  return state.projectTextSearch.query;
}

export default update;
