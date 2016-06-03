/* global window, document */
"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const DevToolsUtils = require("ff-devtools-libs/shared/DevToolsUtils");
const { AppConstants } = require("ff-devtools-libs/sham/appconstants");
const { isEnabled } = require("./configs/feature");

// Set various flags before requiring app code.
if (isEnabled("clientLogging")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

if (isEnabled("development")) {
  AppConstants.DEBUG_JS_MODULES = true;
}

const configureStore = require("./create-store");
const reducers = require("./reducers");
const { getClient, connectClients, startDebugging } = require("./clients");
const firefox = require("./clients/firefox");
const chrome = require("./clients/chrome");

const Tabs = React.createFactory(require("./components/Tabs"));
const App = React.createFactory(require("./components/App"));

const createStore = configureStore({
  log: false,
  makeThunkArgs: (args, state) => {
    let client = getClient(state);
    return Object.assign({}, args, { client });
  }
});
const store = createStore(combineReducers(reducers));
const actions = bindActionCreators(require("./actions"), store.dispatch);

// global for debugging purposes only!
window.store = store;

function getTargetFromQuery() {
  if (window.location.href.indexOf("?ws") !== -1) {
    const m = window.location.href.match(/\?ws=([^&#]*)/);
    return { type: "node", param: m[1] };
  } else if (window.location.href.indexOf("?firefox-tab") !== -1) {
    const m = window.location.href.match(/\?firefox-tab=([^&#]*)/);
    return { type: "firefox", param: m[1] };
  } else if (window.location.href.indexOf("?chrome-tab") !== -1) {
    const m = window.location.href.match(/\?chrome-tab=([^&#]*)/);
    return { type: "chrome", param: m[1] };
  }
  return null;
}

function renderApp() {
  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      App()
    ),
    document.querySelector("#mount")
  );
}

function renderTabs() {
  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      Tabs()
    ),
    document.querySelector("#mount")
  );
}

window.injectDebuggee = require("./test/utils/debuggee");

const connTarget = getTargetFromQuery();

if (connTarget) {
  if (connTarget.type === "node") {
    chrome.connectWebsocket("ws://" + connTarget.param).then(() => {
      chrome.initPage(actions);
      renderApp();
    });
  } else if (connTarget.type === "chrome") {
    startDebugging(chrome, connTarget.param, actions).then(renderApp);
  } else if (connTarget.type === "firefox") {
    startDebugging(firefox, connTarget.param, actions).then(renderApp);
  }
} else if (process.env.NODE_ENV === "DEVTOOLS_PANEL") {
  // The toolbox already provides the tab to debug.
  module.exports = {
    renderApp,
    setThreadClient: firefox.setThreadClient,
    setTabTarget: firefox.setTabTarget,
    initPage: firefox.initPage,
    getBoundActions: () => actions,
  };
} else {
  connectClients().then(tabs => {
    actions.newTabs(tabs);
    renderTabs();
  });
}
