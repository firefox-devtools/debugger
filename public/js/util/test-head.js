"use strict";

const { combineReducers } = require("redux");
const reducers = require("../reducers");
const actions = require("../actions");
const selectors = require("../selectors");
const constants = require("../constants");

const configureStore = require("../create-store");

function createStore(client, initialState = {}) {
  return configureStore({
    log: false,
    makeThunkArgs: args => {
      return Object.assign({}, args, { client });
    }
  })(combineReducers(reducers), initialState);
}

function commonLog(msg, data = {}) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

module.exports = {
  actions, constants, selectors, reducers, createStore, commonLog
};
