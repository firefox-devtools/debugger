const constants = require("../constants");
const { clearSourceMaps } = require("../utils/source-map");
const { clearDocuments } = require("../utils/source-documents");
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
  return ({ dispatch, client, getState }) => {
    (async function() {
      await waitForMs(100);
      if (getSources(getState()).size == 0) {
        const sources = await client.fetchSources();
        dispatch(newSources(sources));
      }
    })();
  };
}

module.exports = {
  willNavigate,
  navigated
};
