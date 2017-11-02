// @flow
import type { QuickOpenAction } from "./types";

export function setQuickOpenQuery(query: string): QuickOpenAction {
  return {
    type: "SET_QUICK_OPEN_QUERY",
    query
  };
}

export function openQuickOpen(query?: string): QuickOpenAction {
  if (query != null) {
    return { type: "OPEN_QUICK_OPEN", query };
  }
  return { type: "OPEN_QUICK_OPEN" };
}

export function closeQuickOpen(): QuickOpenAction {
  return { type: "CLOSE_QUICK_OPEN" };
}
