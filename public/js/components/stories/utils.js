"use strict";

const configureStore = require("../../create-store");
const { combineReducers } = require("redux");
const reducers = require("../../reducers");
const { fromJS } = require("immutable");

function createStore(state = {}) {
  for(var k in state) {
    state[k] = fromJS(state[k]);
  }

  return configureStore({})(combineReducers(reducers), state);
}

module.exports = {
  createStore
};
