const constants = require("../constants");
const { clearSourceMaps } = require("../utils/source-map");
const { clearDocuments } = require("../utils/source-documents");
const { firefox } = require("devtools-client-adapters");
const { getSources } = require("../reducers/sources");

/**
 * Redux actions for the navigation state
 * @module actions/navigation
 */

/**
 * @memberof actions/navigation
 * @static
 */
function willNavigate() {
  clearSourceMaps();
  clearDocuments();

  return { type: constants.NAVIGATE };
}

/**
 * @memberof actions/navigation
 * @static
 */
function navigated() {
  return ({ dispatch, getState }: ThunkArgs) => {
    setTimeout(() => {
      if (getSources(getState()).size == 0) {
        const threadClient = firefox.getThreadClient();
        threadClient.getSources();
      }
    }, 100);
  };
}

module.exports = {
  willNavigate,
  navigated
};
