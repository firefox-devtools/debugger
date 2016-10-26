// @flow
const constants = require("../constants");

function toggleFileSearch(searchOn: boolean) {
  return ({ dispatch }) => {
    dispatch({
      type: constants.TOGGLE_FILE_SEARCH,
      searchOn
    });
  };
}

module.exports = {
  toggleFileSearch
};
