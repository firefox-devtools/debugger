const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { combineReducers } = require("redux");
const dehydrate = require("../../utils/dehydrate-state");

const fixtures = require("../fixtures");
const configureStore = require("../../utils/create-store");
const reducers = require("../../reducers");

function createStore(state = {}) {
  return configureStore({})(combineReducers(reducers), state);
}

function getData(fixtureName) {
  const fixture = fixtures[fixtureName];

  if (!fixture) {
    throw new Error(`Fixture ${fixtureName} not found`);
  }

  return dehydrate(fixture);
}

function renderComponentFromFixture(Component, fixtureName,
  { style = {}}) {
  const data = getData(fixtureName);
  const store = createStore(data);

  return dom.div(
    { className: "theme-light", style },
    createElement(Provider, { store }, Component)
  );
}

module.exports = renderComponentFromFixture;
