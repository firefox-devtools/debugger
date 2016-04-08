/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";
const { Task } = require('devtools/sham/task');
const { PROMISE } = require('devtools/client/shared/redux/middleware/promise');

const { connectToTab} = require('../client');
const constants = require('../constants');
const { getTabs } = require('../queries');

function newTabs(tabs) {
  return {
    type: constants.ADD_TABS,
    value: tabs
  };
}

function selectTab({ tabActor }) {
  return (dispatch, getState) => {
    const tabs = getTabs(getState());
    const selectedTab = tabs[tabActor];

    // set selected tab in the URL hash
    const childId = tabActor.match(/child\d+/)[0];
    window.location.hash = `tab=${childId}`

    return dispatch({
      type: constants.SELECT_TAB,
      tabActor: tabActor,
      [PROMISE]: Task.spawn(function*() {
        yield connectToTab(selectedTab);
        return { selectedTab };
      })
    });
  }
}

module.exports = {
  newTabs,
  selectTab
};
