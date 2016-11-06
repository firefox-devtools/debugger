// @flow
const constants = require("../constants");

function toggleFileSearch(searchOn: boolean) {
  return {
    type: constants.TOGGLE_FILE_SEARCH,
    searchOn
  };
}

module.exports = {
  toggleFileSearch
};
