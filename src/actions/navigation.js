const constants = require("../constants");
const { clearSourceMaps } = require("../utils/source-map");
const { clearDocuments } = require("../utils/source-documents");

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
  return ({ dispatch }) => {
    // We need to load all the sources again because they might have
    // come from bfcache, so we won't get a `newSource` notification.
    //
    // TODO: This seems to be buggy on the debugger server side. When
    // the page is loaded from bfcache, we still get sources from the
    // *previous* page as well. For now, emulate the current debugger
    // behavior by not showing sources loaded by bfcache.
    // return dispatch(sources.loadSources());
  };
}

module.exports = {
  willNavigate,
  navigated
};
