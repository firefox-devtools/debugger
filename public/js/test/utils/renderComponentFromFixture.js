const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS, Map } = require("immutable");
const { combineReducers } = require("redux");
const dehydrate = require("../../util/dehydrate-state");

const fixtures = require("../fixtures");
const configureStore = require("../../util/create-store");
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
    { style },
    createElement(Provider, { store }, Component)
  );
}

module.exports = renderComponentFromFixture;
