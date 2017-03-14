// @flow
const constants = require("../constants");
const {
  getSource,
  getProjectSearchState,
  getFileSearchState
} = require("../selectors");
import type { ThunkArgs } from "./types";

function toggleProjectSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_SEARCH,
        field: "projectSearchOn",
        value: toggleValue
      });
    } else {
      dispatch({
        type: constants.TOGGLE_SEARCH,
        field: "projectSearchOn",
        value: !getProjectSearchState(getState())
      });
    }
  };
}

function toggleFileSearch(toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.TOGGLE_SEARCH,
        field: "fileSearchOn",
        value: toggleValue
      });
    } else {
      dispatch({
        type: constants.TOGGLE_SEARCH,
        field: "fileSearchOn",
        value: !getFileSearchState(getState())
      });
    }
  };
}

function showSource(sourceId: string) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    dispatch({
      type: constants.SHOW_SOURCE,
      sourceUrl: source.get("url")
    });
  };
}

function togglePaneCollapse(position: string, paneCollapsed: boolean) {
  return {
    type: constants.TOGGLE_PANE,
    position,
    paneCollapsed
  };
}

module.exports = {
  toggleFileSearch,
  toggleProjectSearch,
  showSource,
  togglePaneCollapse
};
