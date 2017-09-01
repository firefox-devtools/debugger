import type { ThunkArgs } from "./types";

export function setSourceSearchQuery(queryString: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "SET_QUERY_STRING",
      queryString
    });
  };
}

export function clearSourceSearchQuery() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "CLEAR_QUERY_STRING"
    });
  };
}
