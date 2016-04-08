const React = require('react');
const ReactDOM = require('react-dom');
const { combineReducers, applyMiddleware, bindActionCreators } = require('redux');
const { Provider } = require('react-redux');
const configureStore = require('./create-store');
const reducers = require('./reducers');
const { connectToClient } = require('./client');
const actions = require('./actions');
const dom = React.DOM;
const TabList = React.createFactory(require('./components/TabList'));

const createStore = configureStore({ log: true });
const store = createStore(combineReducers(reducers));
window.store = store; // global for debugging purposes only!

connectToClient(response => {
  const tabs = response.tabs;
  store.dispatch(actions.newTabs(response.tabs));

  // if there's a pre-selected tab, connect to it and load the sources.
  // otherwise, just show the toolbox.
  if (hasSelectedTab()){
    const selectedTab = getSelectedTab(tabs);
    store.dispatch(actions.selectTab({tabActor: selectedTab.actor}))
      .then(() => store.dispatch(actions.loadSources()))
      .then(renderToolbox)
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
  return tabs.find((tab) => tab.actor.includes(childId));
}

function renderToolbox() {
  ReactDOM.render(
    React.createElement(
      Provider,
      { store },
      TabList()
    ),
    document.querySelector('#mount')
  );
}
