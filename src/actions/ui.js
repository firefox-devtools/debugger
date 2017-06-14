// @flow

import {
  getSource,
  getProjectSearchState,
  getFileSearchState
} from "../selectors";
import type { ThunkArgs } from "./types";
import type { SymbolSearchType } from "../reducers/ui";

export function toggleProjectSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const projectSearchState = getProjectSearchState(getState());
    if (toggleValue === undefined) {
      return dispatch({
        type: "TOGGLE_PROJECT_SEARCH",
        value: !projectSearchState
      });
    }

    if (projectSearchState == toggleValue) {
      return;
    }

    dispatch({
      type: "TOGGLE_PROJECT_SEARCH",
      value: toggleValue
    });
  };
}

export function toggleFileSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: "TOGGLE_FILE_SEARCH",
        value: toggleValue
      });
    } else {
      dispatch({
        type: "TOGGLE_FILE_SEARCH",
        value: !getFileSearchState(getState())
      });
    }
  };
}

export function toggleSymbolSearch(toggleValue: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: "TOGGLE_SYMBOL_SEARCH",
      value: toggleValue
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

export function updateSymbolSearchResults(results: Array<*>) {
  return {
    type: "UPDATE_SYMBOL_SEARCH_RESULTS",
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
