/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
 /* global window */
"use strict";

const constants = require("../constants");

function newTabs(tabs) {
  return {
    type: constants.ADD_TABS,
    value: tabs
  };
}

function selectTab({ tabActor }) {
  // set selected tab in the URL hash
  let childId;
  if (tabActor.includes("child")) {
    childId = tabActor.match(/child\d+/)[0];
  } else {
    childId = tabActor.match(/tab\d+/)[0];
  }

  window.location.hash = `tab=${childId}`;

  return {
    type: constants.SELECT_TAB,
    tabActor: tabActor,
  };
}

module.exports = {
  newTabs,
  selectTab
};
