/* global window, document, DebuggerConfig */

const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const ReactDOM = require("react-dom");
const React = require("react");

const DevToolsUtils = require("devtools-sham/shared/DevToolsUtils");
const AppConstants = require("devtools-sham/sham/appconstants").AppConstants;
const { injectGlobals } = require("./utils/debug");
const { isEnabled, isFirefoxPanel, getValue,
        isDevelopment, setConfig } = require("../../config/feature");

setConfig(DebuggerConfig);

// Set various flags before requiring app code.
if (isEnabled("logging.client")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

const { getClient, connectClients, startDebugging } = require("./clients");
const firefox = require("./clients/firefox");
const configureStore = require("./utils/create-store");
const reducers = require("./reducers");
const selectors = require("./selectors");

const Tabs = require("./components/Tabs");
const App = require("./components/App");

const createStore = configureStore({
  log: getValue("logging.actions"),
  makeThunkArgs: (args, state) => {
    return Object.assign({}, args, { client: getClient(state) });
  }
});

const store = createStore(combineReducers(reducers));
const actions = bindActionCreators(require("./actions"), store.dispatch);

if (isDevelopment()) {
  AppConstants.DEBUG_JS_MODULES = true;
  injectGlobals({ store });
}

// Expose the bound actions so external things can do things like
// selecting a source.
window.actions = {
  selectSource: actions.selectSource,
  selectSourceURL: actions.selectSourceURL
};

function renderRoot(component) {
  const mount = document.querySelector("#mount");

  // bail in test environments that do not have a mount
  if (!mount) {
    return;
  }

  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      React.createElement(component)
    ),
    mount
  );
}

function getTargetFromQuery() {
  const href = window.location.href;
  const nodeMatch = href.match(/ws=([^&#]*)/);
  const firefoxMatch = href.match(/firefox-tab=([^&#]*)/);
  const chromeMatch = href.match(/chrome-tab=([^&#]*)/);

  if (nodeMatch) {
    return { type: "node", param: nodeMatch[1] };
  } else if (firefoxMatch) {
    return { type: "firefox", param: firefoxMatch[1] };
  } else if (chromeMatch) {
    return { type: "chrome", param: chromeMatch[1] };
  }

  return null;
}

const connTarget = getTargetFromQuery();
if (connTarget) {
  startDebugging(connTarget, actions).then((tabs) => {
    actions.newTabs(tabs);
    actions.selectTab({ id: connTarget.param });
    renderRoot(App);
  });
} else if (isFirefoxPanel()) {
  // The toolbox already provides the tab to debug.
  function bootstrap({ threadClient, tabTarget }) {
    firefox.setThreadClient(threadClient);
    firefox.setTabTarget(tabTarget);
    firefox.initPage(actions);
    renderRoot(App);
  }

  module.exports = {
    bootstrap,
    store: store,
    actions: actions,
    selectors: selectors,
    client: firefox.clientCommands
  };
} else {
  renderRoot(Tabs);
  connectClients().then(tabs => {
    actions.newTabs(tabs);
  });
}
