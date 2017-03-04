// @flow
const constants = require("../constants");
import selectors from "../selectors";

const { getSource, getFileSearchState } = selectors;
import type { ThunkArgs } from "./types";

function toggleFileSearch() {
  return ({ dispatch, getState }: ThunkArgs) => {
    dispatch({
      type: constants.SET_FILE_SEARCH,
      searchOn: !getFileSearchState(getState())
    });
  };
}

function closeFileSearch() {
  return {
    type: constants.SET_FILE_SEARCH,
    searchOn: false
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
  closeFileSearch,
  showSource,
  togglePaneCollapse
};
