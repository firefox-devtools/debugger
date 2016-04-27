"use strict";

const { combineReducers } = require("redux");
const reducers = require("../reducers");
const actions = require("../actions");
const selectors = require("../selectors");

const configureStore = require("../create-store");

function createStore(threadClient, initialState = {}) {
  return configureStore({
    log: false,
    makeThunkArgs: args => {
      return Object.assign({}, args, { threadClient: threadClient });
    }
  })(combineReducers(reducers), initialState);
}

function commonLog(msg, data = {}) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

module.exports = { actions, selectors, reducers, createStore, commonLog };
