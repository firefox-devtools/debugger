// @flow
const constants = require("../constants");

function toggleFileSearch(searchOn: boolean) {
  return {
    type: constants.TOGGLE_FILE_SEARCH,
    searchOn
  };
}

function saveFileSearchInput(previousInput: string) {
  return {
    type: constants.SAVE_FILE_SEARCH_INPUT,
    previousInput
  };
}

module.exports = {
  toggleFileSearch,
  saveFileSearchInput
};
