// @flow
const constants = require("../constants");
const { getSource } = require("../selectors");
import type { ThunkArgs } from "./types";

function toggleFileSearch(searchOn: boolean) {
  return {
    type: constants.TOGGLE_FILE_SEARCH,
    searchOn
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

function highlightSource(sourceUrl: string) {
  return {
    type: constants.HIGHLIGHT_SOURCE,
    sourceUrl
  };
}

module.exports = {
  toggleFileSearch,
  showSource,
  highlightSource
};
