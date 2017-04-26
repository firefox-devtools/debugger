// @flow
import constants from "../constants";
import { getProjectSearchState, getFileSearchState } from "../selectors";
import type { ThunkArgs } from "./types";

export function toggleProjectSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_PROJECT_SEARCH,
        value: toggleValue
      });
    } else {
      dispatch({
        type: constants.TOGGLE_PROJECT_SEARCH,
        value: !getProjectSearchState(getState())
      });
    }
  };
}

export function toggleFileSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_FILE_SEARCH,
        value: toggleValue
      });
    } else {
      dispatch({
        type: constants.TOGGLE_FILE_SEARCH,
        value: !getFileSearchState(getState())
      });
    }
  };
}

export function toggleSymbolSearch(toggleValue: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: constants.TOGGLE_SYMBOL_SEARCH,
      value: toggleValue
    });
  };
}

export function setSelectedSymbolType(symbolType: "functions" | "variables") {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: constants.SET_SYMBOL_SEARCH_TYPE,
      symbolType
    });
  };
}

export function setFileSearchQuery(query: string) {
  return {
    type: constants.UPDATE_FILE_SEARCH_QUERY,
    query
  };
}

export function toggleFileSearchModifier(modifier: string) {
  return { type: constants.TOGGLE_FILE_SEARCH_MODIFIER, modifier };
}

export function togglePaneCollapse(position: string, paneCollapsed: boolean) {
  return {
    type: constants.TOGGLE_PANE,
    position,
    paneCollapsed
  };
}
