"use strict";

const configureStore = require("../../create-store");
const { combineReducers } = require("redux");
const reducers = require("../../reducers");

function createStore(state = {}) {
  return configureStore({})(combineReducers(reducers), state);
}

module.exports = {
  createStore
};
