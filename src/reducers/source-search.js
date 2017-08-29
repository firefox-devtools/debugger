import makeRecord from "../utils/makeRecord";
import type { SourceSearchAction } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type SourceSearchState = {
  queryString: string,
  selectedItem: number
};

function InitialState(): Record<SourceSearchState> {
  return makeRecord({
    queryString: "",
    selectedItem: 0
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

export function getSourceSearchQueryString(state: OuterState) {
  return state.sourceSearch.get("queryString");
}
