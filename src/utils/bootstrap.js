const React = require("react");
const { bindActionCreators, combineReducers } = require("redux");
const ReactDOM = require("react-dom");
const { getValue, isFirefoxPanel } = require("devtools-config");
const { renderRoot } = require("devtools-launchpad");

const configureStore = require("./create-store");
const reducers = require("../reducers");
const selectors = require("../selectors");

const App = require("../components/App").default;

export function bootstrapStore(client) {
  const commands = client.clientCommands;

  const createStore = configureStore({
    log: getValue("logging.actions"),
    makeThunkArgs: (args, state) => {
      return Object.assign({}, args, { client: commands });
    },
  });

  const store = createStore(combineReducers(reducers));
  const actions = bindActionCreators(
    require("../actions").default,
    store.dispatch
  );

  return { store, actions };
}

export function bootstrapApp(connection, { store, actions }) {
  const { clientType } = connection;

  window.appStore = store;

  // Expose the bound actions so external things can do things like
  // selecting a source.
  window.actions = {
    selectSource: actions.selectSource,
    selectSourceURL: actions.selectSourceURL,
  };

  // Globals needed for mocha integration tests
  window.getGlobalsForTesting = () => {
    return {
      debuggerStore: store,
      launchpadStore: window.launchpadStore,
      selectors,
      actions,
      threadClient: firefox.getThreadClient(),
      target: firefox.getTabTarget(),
    };
  };

  renderRoot(React, ReactDOM, App, store);

  return { store, actions, selectors };
}
