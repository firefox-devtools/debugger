/* global window, document */
"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const { bindActionCreators, combineReducers } = require("redux");
const { Provider } = require("react-redux");

const configureStore = require("./create-store");
const reducers = require("./reducers");
const { connectClient, getThreadClient, debugTab } = require("./client");
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

connectClient(response => {
  actions.newTabs(response.tabs);

  // if there's a pre-selected tab, connect to it and load the sources.
  // otherwise, just show the toolbox.
  if (hasSelectedTab()) {
    const selectedTab = getSelectedTab(store.getState().tabs.get("tabs"));
    debugTab(selectedTab.toJS(), actions).then(renderToolbox);
  } else {
    renderToolbox();
  }
});

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
function getSelectedTab(tabs) {
  const childId = window.location.hash.split("=")[1];
  return tabs.find(tab => tab.get("actor").includes(childId));
}

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
