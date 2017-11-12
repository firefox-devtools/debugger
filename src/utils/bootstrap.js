/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { bindActionCreators, combineReducers } from "redux";
import ReactDOM from "react-dom";
import {
  getValue,
  isFirefoxPanel,
  isDevelopment,
  isTesting
} from "devtools-config";
import { renderRoot } from "devtools-launchpad";
import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";
import { startSearchWorker, stopSearchWorker } from "../workers/search";

import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../workers/pretty-print";
import { startParserWorker, stopParserWorker } from "../workers/parser";
import configureStore from "../actions/utils/create-store";
import reducers from "../reducers";
import selectors from "../selectors";
import App from "../components/App";
import { prefs } from "./prefs";

export function bootstrapStore(client, { services, toolboxActions }) {
  const createStore = configureStore({
    log: isTesting() || getValue("logging.actions"),
    timing: isDevelopment(),
    makeThunkArgs: (args, state) => {
      return { ...args, client, ...services, ...toolboxActions };
    }
  });

  const store = createStore(combineReducers(reducers));
  store.subscribe(() => updatePrefs(store.getState()));

  const actions = bindActionCreators(
    require("../actions").default,
    store.dispatch
  );

  return { store, actions, selectors };
}

export function bootstrapApp(connection, { store, actions }) {
  window.appStore = store;

  // Expose the bound actions so external things can do things like
  // selecting a source.
  window.actions = {
    selectSource: actions.selectSource,
    selectSourceURL: actions.selectSourceURL
  };

  renderRoot(React, ReactDOM, App, store);
}

export function bootstrapWorkers() {
  if (!isFirefoxPanel()) {
    // When used in Firefox, the toolbox manages the source map worker.
    startSourceMapWorker(getValue("workers.sourceMapURL"));
  }
  startPrettyPrintWorker(getValue("workers.prettyPrintURL"));
  startParserWorker(getValue("workers.parserURL"));
  startSearchWorker(getValue("workers.searchURL"));
}

export function teardownWorkers() {
  if (!isFirefoxPanel()) {
    // When used in Firefox, the toolbox manages the source map worker.
    stopSourceMapWorker();
  }
  stopPrettyPrintWorker();
  stopParserWorker();
  stopSearchWorker();
}

function updatePrefs(state) {
  const pendingBreakpoints = selectors.getPendingBreakpoints(state);

  if (prefs.pendingBreakpoints !== pendingBreakpoints) {
    prefs.pendingBreakpoints = pendingBreakpoints;
  }
}
