/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 /* global window */

/**
 * Redux actions for the pause state
 * @module actions/tabs
 */

const constants = require("../constants");

/**
 * @typedef {Object} TabAction
 * @memberof actions/tabs
 * @static
 * @property {number} type The type of Action
 * @property {number} value The payload of the Action
 */

/**
 * @memberof actions/tabs
 * @static
 * @param {Array} tabs
 * @returns {TabAction} with type constants.ADD_TABS and tabs as value
 */
function newTabs(tabs) {
  return {
    type: constants.ADD_TABS,
    value: tabs
  };
}

/**
 * @memberof actions/tabs
 * @static
 * @param {String} $0.id Unique ID of the tab to select
 * @returns {TabAction}
 */
function selectTab({ id }) {
  return {
    type: constants.SELECT_TAB,
    id: id,
  };
}

module.exports = {
  newTabs,
  selectTab
};
