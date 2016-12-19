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

function showSource(sourceId: string, randomNum: number) {
  return ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    dispatch({
      type: constants.SHOW_SOURCE,
      sourceUrl: source.get("url"),
      randomNum
    });
  };
}

module.exports = {
  toggleFileSearch,
  showSource
};
