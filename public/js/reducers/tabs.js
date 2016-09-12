/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// const constants = require("../constants");
const Immutable = require("immutable");
const fromJS = require("../utils/fromJS");
const { createReducer } = require("../utils/redux/utils");

/**
 * Redux reducer for the tabs state
 * @module reducers/tabs
 */

const initialState = fromJS({
  tabs: {},
  selectedTab: null,
});

/**
 * Triggered when the debugger is started with the connected tabs
 * @memberof reducers/tabs
 * @static
 */
function addTabs(state, action) {
  const tabs = action.value;
  if (!tabs) {
    return state;
  }

  return state.mergeIn(
    ["tabs"],
    Immutable.Map(tabs.map(tab => {
      tab = Object.assign({}, tab, { id: getTabId(tab) });
      return [tab.id, Immutable.Map(tab)];
    }))
  );
}

/**
 * Triggered when a specific tab is selected for debugging
 * @memberof reducers/tabs
 * @static
 */
function selectTab(state, action) {
  const tab = state.getIn(["tabs", action.id]);
  return state.setIn(["selectedTab"], tab);
}

function getTabId(tab) {
  let id = tab.id;
  const isFirefox = tab.browser == "firefox";

  // NOTE: we're getting the last part of the actor because
  // we want to ignore the connection id
  if (isFirefox) {
    id = tab.id.split(".").pop();
  }

  return id;
}

const update = createReducer(initialState, { addTabs, selectTab });
module.exports = update;
