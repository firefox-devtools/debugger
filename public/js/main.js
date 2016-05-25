/* global window, document */
"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");
const DevToolsUtils = require("ff-devtools-libs/shared/DevToolsUtils");
const { AppConstants } = require("ff-devtools-libs/sham/appconstants");
const { isEnabled } = require("./configs/feature");
const { getTabs, getSelectedTab } = require("./selectors");

// Set various flags before requiring app code.
if (isEnabled("clientLogging")) {
  DevToolsUtils.dumpn.wantLogging = true;
}

if (isEnabled("development")) {
  AppConstants.DEBUG_JS_MODULES = true;
}

const configureStore = require("./create-store");
const reducers = require("./reducers");
const {
  connectClient, connectThread,
  setThreadClient, setTabTarget, initPage } = require("./clients/firefox");

const { chromeTabs } = require("./clients/chrome");
const { getBrowserClient, debugPage } = require("./clients");


const TabList = React.createFactory(require("./components/TabList"));

Array.prototype.peekLast = function() {
  return this[this.length - 1];
}

const createStore = configureStore({
  log: false,
  makeThunkArgs: (args, state) => {
    let client = getBrowserClient(state);
    return Object.assign({}, args, { threadClient: client });
  }
});
const store = createStore(combineReducers(reducers));
const actions = bindActionCreators(require("./actions"), store.dispatch);

// global for debugging purposes only!
window.store = store;

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

if (process.env.NODE_ENV !== "DEVTOOLS_PANEL") {
  connectClient(tabs => {
    actions.newTabs(tabs);

    // if there's a pre-selected tab, connect to it and load the sources.
    // otherwise, just show the toolbox.
    if (hasSelectedTab()) {
      const selectedTab = getTabFromUri(store.getState());
      debugPage(selectedTab, actions).then(renderToolbox);
      actions.selectTab({ id: selectedTab.get("id") });
    } else {
      renderToolbox();
    }
  });

  if (isEnabled("chrome.debug")) {
    chromeTabs(response => {
      actions.newTabs(response);
    });
  }
} else {
  // The toolbox already provides the tab to debug. For now, just
  // provide a fake tab so it will show the debugger. We only use it
  // when connecting which we don't do because the toolbox has already
  // done all that.
  actions.newTabs([{ actor: "tab1" }]);
  actions.selectTab({ tabActor: "tab1" });

  module.exports = {
    renderToolbox,
    setThreadClient,
    setTabTarget,
    getBoundActions: () => actions,
    initPage
  };
}
