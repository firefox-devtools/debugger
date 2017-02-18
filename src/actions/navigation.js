const constants = require("../constants");
const { clearSourceMaps } = require("devtools-source-map");
const { clearDocuments } = require("../utils/editor");
const { getSources } = require("../reducers/sources");
const { waitForMs } = require("../utils/utils");
const { newSources } = require("./sources");

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
  return async function({ dispatch, getState, client }: ThunkArgs) {
    await waitForMs(100);
    if (getSources(getState()).size == 0) {
      const sources = await client.fetchSources();
      dispatch(newSources(sources));
    }
  };
}

module.exports = {
  willNavigate,
  navigated
};
