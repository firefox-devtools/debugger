// @flow
const constants = require("../constants");
const {
  getSource,
  getProjectSearchState,
  getFileSearchState,
} = require("../selectors");
import type { ThunkArgs } from "./types";

function toggleProjectSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_PROJECT_SEARCH,
        value: toggleValue,
      });
    } else {
      dispatch({
        type: constants.TOGGLE_PROJECT_SEARCH,
        value: !getProjectSearchState(getState()),
      });
    }
  };
}

function toggleFileSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_FILE_SEARCH,
        value: toggleValue,
      });
    } else {
      dispatch({
        type: constants.TOGGLE_FILE_SEARCH,
        value: !getFileSearchState(getState()),
      });
    }
  };
}

function setFileSearchQuery(query: string) {
  return {
    type: constants.UPDATE_FILE_SEARCH_QUERY,
    query,
  };
}

function toggleFileSearchModifier(modifier: string) {
  return { type: constants.TOGGLE_FILE_SEARCH_MODIFIER, modifier };
}

function showSource(sourceId: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    dispatch({
      type: constants.SHOW_SOURCE,
      sourceUrl: source.get("url"),
    });
  };
}

function togglePaneCollapse(position: string, paneCollapsed: boolean) {
  return {
    type: constants.TOGGLE_PANE,
    position,
    paneCollapsed,
  };
}

module.exports = {
  toggleFileSearch,
  setFileSearchQuery,
  toggleFileSearchModifier,
  toggleProjectSearch,
  showSource,
  togglePaneCollapse,
};
