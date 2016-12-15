// @flow

const React = require("react");
const { bindActionCreators, combineReducers } = require("redux");
const ReactDOM = require("react-dom");

const { getClient, firefox } = require("devtools-client-adapters");
const { renderRoot, bootstrap, L10N } = require("devtools-launchpad");
const { getValue, isFirefoxPanel } = require("devtools-config");

const configureStore = require("./utils/create-store");
const { onConnect, onFirefoxConnect } = require("./utils/client");

const reducers = require("./reducers");
const selectors = require("./selectors");

const App = require("./components/App");

const createStore = configureStore({
  log: getValue("logging.actions"),
  makeThunkArgs: (args, state) => {
    return Object.assign({}, args, { client: getClient(state) });
  }
});

const store = createStore(combineReducers(reducers));
const actions = bindActionCreators(require("./actions"), store.dispatch);

if (!isFirefoxPanel()) {
  window.L10N = L10N;
  window.L10N.setBundle(require("./strings.json"));
}

// Expose the bound actions so external things can do things like
// selecting a source.
window.actions = {
  selectSource: actions.selectSource,
  selectSourceURL: actions.selectSourceURL
};

// Globals needed for mocha integration tests
window.getGlobalsForTesting = function () {
  return {
    debuggerStore: store,
    launchpadStore: window.launchpadStore,
    selectors,
    actions
  };
}

function unmountRoot() {
  const mount = document.querySelector("#mount");
  ReactDOM.unmountComponentAtNode(mount);
}

if (isFirefoxPanel()) {
  const sourceMap = require("./utils/source-map");
  const prettyPrint = require("./utils/pretty-print");

  module.exports = {
    bootstrap: ({ threadClient, tabTarget, toolbox }: any) => {
      // jlast: remove when docker updates
      if (!window.L10N) {
        window.L10N = L10N;
        window.L10N.setBundle(require("./strings.json"));
      }

      firefox.setThreadClient(threadClient);
      firefox.setTabTarget(tabTarget);
      renderRoot(React, ReactDOM, App, store);
      firefox.initPage(actions);
      onFirefoxConnect(actions, firefox);
    },
    destroy: () => {
      unmountRoot();
      sourceMap.destroyWorker();
      prettyPrint.destroyWorker();
    },
    store: store,
    actions: actions,
    selectors: selectors,
    client: firefox.clientCommands
  };
} else {
  bootstrap(React, ReactDOM, App, actions, store)
    .then(conn => onConnect(conn, actions));
}
