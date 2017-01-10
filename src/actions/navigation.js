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
  return ({ dispatch }) => {};
}

module.exports = { willNavigate, navigated };