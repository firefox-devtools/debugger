// @flow
import constants from "../constants";
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
        type: constants.TOGGLE_PROJECT_SEARCH,
        value: !projectSearchState
      });
    }

    if (projectSearchState == toggleValue) {
      return;
    }

    dispatch({
      type: constants.TOGGLE_PROJECT_SEARCH,
      value: toggleValue
    });
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

export function setSelectedSymbolType(symbolType: SymbolSearchType) {
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

export function showSource(sourceId: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    dispatch({
      type: constants.SHOW_SOURCE,
      sourceUrl: source.get("url")
    });
  };
}

export function togglePaneCollapse(position: string, paneCollapsed: boolean) {
  return {
    type: constants.TOGGLE_PANE,
    position,
    paneCollapsed
  };
}
