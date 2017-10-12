/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Source search reducer
 * @module reducers/source-search
 */

import makeRecord from "../utils/makeRecord";
import type { SourceSearchAction } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type SourceSearchState = {
  queryString: string
};

function InitialState(): Record<SourceSearchState> {
  return makeRecord({
    queryString: ""
  })();
}

export default function update(
  state: Record<SourceSearchState> = InitialState(),
  action: SourceSearchAction
): Record<SourceSearchState> {
  switch (action.type) {
    case "SET_QUERY_STRING":
      return state.update("queryString", value => action.queryString);
    case "CLEAR_QUERY_STRING":
      return state.update("queryString", value => "");
    default:
      return state;
  }
}

type OuterState = {
  sourceSearch: Record<SourceSearchState>
};

export function getSourceSearchQuery(state: OuterState) {
  return state.sourceSearch.get("queryString");
}
