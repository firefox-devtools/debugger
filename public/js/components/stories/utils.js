"use strict";

const configureStore = require("../../create-store");
const { combineReducers } = require("redux");
const reducers = require("../../reducers");
const { fromJS } = require("immutable");

function createStore({ sources = {}, breakpoints = {} } = {}) {
  return configureStore({})(combineReducers(reducers), {
    sources: fromJS({ sources }),
    breakpoints: fromJS({ breakpoints })
  });
}

module.exports = {
  createStore
};
