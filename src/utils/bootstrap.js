const React = require("react");
const { bindActionCreators, combineReducers } = require("redux");
const ReactDOM = require("react-dom");
const { getValue, isFirefoxPanel } = require("devtools-config");
const { renderRoot } = require("devtools-launchpad");
const {
  startSourceMapWorker,
  stopSourceMapWorker
} = require("devtools-source-map");
const {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} = require("../utils/pretty-print");
const { startParserWorker, stopParserWorker } = require("../utils/parser");

const configureStore = require("./create-store");
import reducers from "../reducers";
const selectors = require("../selectors");

const App = require("../components/App").default;

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
