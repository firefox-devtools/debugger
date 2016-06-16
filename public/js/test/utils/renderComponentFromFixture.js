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

  if (!fixture) {
    throw new Error(`Fixture ${fixtureName} not found`);
  }

  let pauseData = fixture.pause;
  if (fixture.pause) {
    pauseData = Map({
      pause: fromJS(fixture.pause.pause),
      loadedObjects: fromJS(fixture.pause.loadedObjects),
      frames: fixture.pause.frames
    });
  }

  return {
    pause: pauseData,
    sources: Map({
      sources: fromJS(fixture.sources.sources),
      selectedSource: fromJS(fixture.sources.selectedSource),
      sourcesText: fromJS(fixture.sources.sourcesText),
      tabs: fromJS(fixture.sources.tabs)
    }),
    breakpoints: Map({
      breakpoints: fromJS(fixture.breakpoints.breakpoints)
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
