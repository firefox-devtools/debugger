/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Quick Open reducer
 * @module reducers/quick-open
 */

import makeRecord from "../utils/makeRecord";
import { parseQuickOpenQuery } from "../utils/quick-open";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type QuickOpenType =
  | "sources"
  | "functions"
  | "variables"
  | "goto"
  | "gotoSource";

type QuickOpenState = {
  queryString: string,
  searchType: QuickOpenType
};

export const State = makeRecord({
  queryString: "",
  searchType: "sources"
});

export default function update(
  state: Record<QuickOpenState> = State(),
  action: Action
): Record<QuickOpenState> {
  switch (action.type) {
    case "OPEN_QUICK_OPEN":
      if (action.query != null) {
        return state.merge({
          queryString: action.query,
          searchType: parseQuickOpenQuery(action.query)
        });
      }
      return state;
    case "CLOSE_QUICK_OPEN":
      return state.merge({
        queryString: "",
        searchType: "sources"
      });
    case "SET_QUERY_STRING":
      return state.merge({
        queryString: action.queryString,
        searchType: parseQuickOpenQuery(action.queryString)
      });
    default:
      return state;
  }
}

type OuterState = {
  quickOpen: Record<QuickOpenState>
};

export function getQuickOpenQuery(state: OuterState) {
  return state.quickOpen.get("queryString");
}

export function getQuickOpenType(state: OuterState): QuickOpenType {
  return state.quickOpen.get("searchType");
}
