// @flow
const constants = require("../constants");
const { getSource, getSearchFieldState } = require("../selectors");
import type { ThunkArgs } from "./types";

function toggleSearchVisibility(field: string, toggleValue?: boolean) {
  return ({ dispatch, getState }: ThunkArgs) => {
    if (toggleValue != null) {
      dispatch({
        type: constants.SET_FILE_SEARCH,
        field,
        value: toggleValue
      });
    } else {
      dispatch({
        type: constants.SET_FILE_SEARCH,
        field,
        value: !getSearchFieldState(getState(), field)
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
  toggleSearchVisibility,
  showSource,
  togglePaneCollapse
};
