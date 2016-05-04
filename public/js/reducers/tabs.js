/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const Immutable = require("immutable");

const initialState = Immutable.fromJS({
  tabs: {},
  selectedTab: null,
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_TABS:
      const tabs = action.value;
      if (!tabs) {
        return state;
      }

      return state.mergeIn(
        ["tabs"],
        Immutable.Map(tabs.map(tab => [tab.actor, Immutable.Map(tab)]))
      );
    case constants.SELECT_TAB:
      const tab = state.getIn(["tabs", action.tabActor]);
      return state.setIn(["selectedTab"], tab);
  }

  return state;
}

module.exports = update;
