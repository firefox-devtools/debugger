/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { bindActionCreators, combineReducers } from "redux";
import ReactDOM from "react-dom";
const { Provider } = require("react-redux");

import {
  getValue,
  isFirefoxPanel,
  isDevelopment,
  isTesting
} from "devtools-config";
import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";
import { startSearchWorker, stopSearchWorker } from "../workers/search";

import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../workers/pretty-print";
import { startParserWorker, stopParserWorker } from "../workers/parser";
import configureStore from "../actions/utils/create-store";
import reducers from "../reducers";
import * as selectors from "../selectors";
import App from "../components/App";
import { prefs } from "./prefs";

function renderPanel(component, store) {
  const root = document.createElement("div");
  root.className = "launchpad-root theme-body";
  root.style.setProperty("flex", 1);
  const mount = document.querySelector("#mount");
  mount.appendChild(root);

  ReactDOM.render(
    React.createElement(Provider, { store }, React.createElement(component)),
    root
  );
}

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

export function bootstrapApp(store) {
  if (isFirefoxPanel()) {
    renderPanel(App, store);
  } else {
    const { renderRoot } = require("devtools-launchpad");
    renderRoot(React, ReactDOM, App, store);
  }
}

function updatePrefs(state) {
  const pendingBreakpoints = selectors.getPendingBreakpoints(state);

  if (prefs.pendingBreakpoints !== pendingBreakpoints) {
    prefs.pendingBreakpoints = pendingBreakpoints;
  }
}
