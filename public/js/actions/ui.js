// @flow
const constants = require("../constants");
import type { ThunkArgs } from "./types";

function toggleFileSearch(searchOn: boolean) {
  return ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: constants.TOGGLE_FILE_SEARCH,
      searchOn
    });
  };
}

module.exports = {
  toggleFileSearch
};
