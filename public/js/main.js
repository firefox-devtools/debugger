/* global window, document */
"use strict";

const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const ReactDOM = require("react-dom");
const React = require("react");

const DevToolsUtils = require("devtools-sham/shared/DevToolsUtils");
const AppConstants = require("devtools-sham/sham/appconstants").AppConstants;
const { injectGlobals } = require("./util/debug");
const { isEnabled, isFirefoxPanel, isDevelopment } = require("../../config/feature");

// Set various flags before requiring app code.
if (isEnabled("clientLogging")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

const { getClient, connectClients, startDebugging } = require("./clients");
const firefox = require("./clients/firefox");
const configureStore = require("./util/create-store");
const reducers = require("./reducers");

const Tabs = require("./components/Tabs");
const App = require("./components/App");

const createStore = configureStore({
  log: false,
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
  startDebugging(connTarget, actions).then(() => {
    renderRoot(App);
  });
} else if (isFirefoxPanel()) {
  // The toolbox already provides the tab to debug.
  module.exports = {
    setThreadClient: firefox.setThreadClient,
    setTabTarget: firefox.setTabTarget,
    initPage: firefox.initPage,
    getActions: () => actions,
    renderApp: () => renderRoot(App)
  };
} else {
  connectClients().then(tabs => {
    actions.newTabs(tabs);
    renderRoot(Tabs);
  });
}
