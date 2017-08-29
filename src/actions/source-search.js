import type { ThunkArgs } from "./types";

export function setSourceSearchQueryString(queryString: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "SET_QUERY_STRING",
      queryString
    });
  };
}

export function clearSourceSearchQueryString() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "CLEAR_QUERY_STRING"
    });
  };
}
