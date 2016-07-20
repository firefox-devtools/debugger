/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const Services = require("Services");
const {FilterState} = require("devtools/client/webconsole/new-console-output/reducers/filters");
const {PrefState} = require("devtools/client/webconsole/new-console-output/reducers/prefs");
const { combineReducers, createStore } = require("devtools/client/shared/vendor/redux");
const { reducers } = require("./reducers/index");

function storeFactory() {
  const initialState = {
    prefs: new PrefState({
      logLimit: Math.max(Services.prefs.getIntPref("devtools.hud.loglimit"), 1),
    }),
    filters: new FilterState({
      error: Services.prefs.getBoolPref("devtools.webconsole.filter.error"),
      warn: Services.prefs.getBoolPref("devtools.webconsole.filter.warn"),
      info: Services.prefs.getBoolPref("devtools.webconsole.filter.info"),
      log: Services.prefs.getBoolPref("devtools.webconsole.filter.log"),
      searchText: ""
    })
  };

  return createStore(combineReducers(reducers), initialState);
}

// Provide the single store instance for app code.
module.exports.store = storeFactory();
// Provide the store factory for test code so that each test is working with
// its own instance.
module.exports.storeFactory = storeFactory;

