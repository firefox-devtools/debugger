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

function addToItemsList(item: object, isAdd: boolean) {
  return {
    type: constants.ADD_TO_ITEMS_LIST,
    item,
    isAdd
  };
}

module.exports = {
  toggleFileSearch,
  showSource,
  addToItemsList
};
