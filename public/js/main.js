/* global window, document */
"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const DevToolsUtils = require("ff-devtools-libs/shared/DevToolsUtils");
const { AppConstants } = require("ff-devtools-libs/sham/appconstants");
const { isEnabled } = require("./configs/feature");
const {  getTabs } = require("./selectors");

// Set various flags before requiring app code.
if (isEnabled("clientLogging")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

if (isEnabled("development")) {
  AppConstants.DEBUG_JS_MODULES = true;
}

const configureStore = require("./create-store");
const reducers = require("./reducers");
const { connectClient, getThreadClient } = require("./clients/firefox");
const { chromeTabs } = require("./clients/chrome");
const TabList = React.createFactory(require("./components/TabList"));

const createStore = configureStore({
  log: false,
  makeThunkArgs: args => {
    return Object.assign({}, args, { threadClient: getThreadClient() });
  }
});
const store = createStore(combineReducers(reducers));
const actions = bindActionCreators(require("./actions"), store.dispatch);

// global for debugging purposes only!
window.store = store;

connectClient(tabs => {
  actions.newTabs(tabs);

  // if there's a pre-selected tab, connect to it and load the sources.
  // otherwise, just show the toolbox.
  if (hasSelectedTab()) {
    const tab = getTabFromUri(store.getState());
    actions.debugTab(tab.toJS(), actions).then(renderToolbox);
  } else {
    renderToolbox();
  }
});

if (isEnabled("chrome.debug")) {
  chromeTabs(response => {
    actions.newTabs(response);
  });
}

/**
 * Check to see if the url hash has a selected tab
 * e.g. #tab=child2
 */
function hasSelectedTab() {
  return window.location.hash.includes("tab");
}

/**
 * get the selected tab from the url hash
 * e.g. #tab=child2
 *
 * tabs are keyed by their child id,
 * this is because the actor connection id increments every refresh and
 * tab id is always 1.
 *
 */
function getTabFromUri(state) {
  const tabs = getTabs(state);
  const id = window.location.hash.split("=")[1];
  return tabs.get(id);
}

setTimeout(function() {
  if (!getTabs(store.getState()).isEmpty()) {
    return;
  }

  ReactDOM.render(
    React.DOM.div({ className: "not-connected-message" },
      "Not connected to Firefox"
    ),
    document.querySelector("#mount"));
}, 500);

function renderToolbox() {
  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      TabList()
    ),
    document.querySelector("#mount")
  );
}
