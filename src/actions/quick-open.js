// @flow
import type { QuickOpenAction } from "./types";

export function setQuickOpenQuery(queryString: string): QuickOpenAction {
  return {
    type: "SET_QUERY_STRING",
    queryString
  };
}
