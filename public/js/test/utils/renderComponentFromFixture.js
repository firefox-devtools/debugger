"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS, Map } = require("immutable");
const { combineReducers } = require("redux");

const fixtures = require("../fixtures");
const configureStore = require("../../create-store");
const reducers = require("../../reducers");

function createStore(state = {}) {
  return configureStore({})(combineReducers(reducers), state);
}

function getData(fixtureName) {
  const fixture = fixtures[fixtureName];
  return {
    pause: Map({
      pause: fromJS(fixture.pause.pause),
      loadedObjects: fromJS(fixture.pause.loadedObjects),
      frames: fixture.pause.frames
    }),
    sources: Map({
      sources: fromJS(fixture.sources.sources)
    })
  };
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
