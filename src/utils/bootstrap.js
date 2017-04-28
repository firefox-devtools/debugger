import React from "react";
import { bindActionCreators, combineReducers } from "redux";
import ReactDOM from "../../node_modules/react-dom/dist/react-dom";
import { getValue, isFirefoxPanel } from "devtools-config";
import { renderRoot } from "devtools-launchpad";
import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";
import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../utils/pretty-print";
import { startParserWorker, stopParserWorker } from "../utils/parser";
import configureStore from "./create-store";
import reducers from "../reducers";
import selectors from "../selectors";
import App from "../components/App";

export function bootstrapStore(client, services) {
  const createStore = configureStore({
    log: getValue("logging.actions"),
    makeThunkArgs: (args, state) => {
      return Object.assign({}, args, { client }, services);
    }
  });

  const store = createStore(combineReducers(reducers));
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
}

export function teardownWorkers() {
  if (!isFirefoxPanel()) {
    // When used in Firefox, the toolbox manages the source map worker.
    stopSourceMapWorker();
  }
  stopPrettyPrintWorker();
  stopParserWorker();
}
