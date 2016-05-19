/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 /* global window */
"use strict";

const constants = require("../constants");
const { debugFirefoxTab } = require("../clients/firefox");
const { debugChromeTab } = require("../clients/chrome");

function newTabs(tabs) {
  return {
    type: constants.ADD_TABS,
    value: tabs
  };
}

function selectTab({ id }) {
  window.location.hash = `tab=${id}`;

  return {
    type: constants.SELECT_TAB,
    id: id,
  };
}

function debugTab(tab, actions) {
  return ({ getState }) => {
    const isFirefox = tab.browser == "firefox";
    actions.selectTab({ id: tab.id });

    const _debugTab = isFirefox ? debugFirefoxTab : debugChromeTab;
    return _debugTab(tab.tab, actions);
  };
}

module.exports = {
  newTabs,
  selectTab,
  debugTab
};
