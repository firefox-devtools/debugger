/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const Immutable = require("seamless-immutable");
const { mergeIn } = require("../utils");

const initialState = Immutable({
  tabs: {},
  selectedTab: {},
});

function update(state = initialState, action) {
  switch (action.type) {
    case constants.ADD_TABS:
      const tabs = action.value;
      if (!tabs) {
        return state;
      }

      const tabsByActor = {};
      tabs.forEach(source => {
        tabsByActor[source.actor] = source;
      });

      return mergeIn(state, ["tabs"], state.tabs.merge(tabsByActor));
    case constants.SELECT_TAB:
      if (action.status == "start") {
        return state;
      }
      return mergeIn(
        state,
        ["selectedTab"],
        state.selectedTab.merge(action.value.selectedTab)
      );
  }

  return state;
}

module.exports = update;
