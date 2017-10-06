// @flow
import { getSource, getActiveSearch } from "../selectors";
import type { ThunkArgs } from "./types";
import type { ActiveSearchType, SymbolSearchType } from "../reducers/ui";
import { clearSourceSearchQuery } from "./source-search";

export function closeActiveSearch() {
  return ({ getState, dispatch }: ThunkArgs) => {
    const activeSearch = getActiveSearch(getState());

    if (activeSearch == "source") {
      dispatch(clearSourceSearchQuery());
    }

    dispatch({
      type: "TOGGLE_ACTIVE_SEARCH",
      value: null
    });
  };
}

export function setActiveSearch(activeSearch?: ActiveSearchType) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const activeSearchState = getActiveSearch(getState());
    if (activeSearchState === activeSearch) {
      return;
    }

    dispatch({
      type: "TOGGLE_ACTIVE_SEARCH",
      value: activeSearch
    });
  };
}

export function toggleFrameworkGrouping(toggleValue: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value: toggleValue
    });
  };
}

export function setSelectedSymbolType(symbolType: SymbolSearchType) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "SET_SYMBOL_SEARCH_TYPE",
      symbolType
    });
  };
}

export function setFileSearchQuery(query: string) {
  return {
    type: "UPDATE_FILE_SEARCH_QUERY",
    query
  };
}

export function updateSearchResults(results: Object) {
  return {
    type: "UPDATE_SEARCH_RESULTS",
    results
  };
}

export function toggleFileSearchModifier(modifier: string) {
  return { type: "TOGGLE_FILE_SEARCH_MODIFIER", modifier };
}

export function showSource(sourceId: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);

    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: ""
    });

    dispatch({
      type: "SHOW_SOURCE",
      sourceUrl: source.get("url")
    });
  };
}

export function togglePaneCollapse(position: string, paneCollapsed: boolean) {
  return {
    type: "TOGGLE_PANE",
    position,
    paneCollapsed
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function highlightLineRange(location: {
  start: number,
  end: number,
  sourceId: number
}) {
  return {
    type: "HIGHLIGHT_LINES",
    location
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function clearHighlightLineRange() {
  return {
    type: "CLEAR_HIGHLIGHT_LINES"
  };
}

export function toggleConditionalBreakpointPanel(line?: number) {
  return {
    type: "TOGGLE_CONDITIONAL_BREAKPOINT_PANEL",
    line: line
  };
}
