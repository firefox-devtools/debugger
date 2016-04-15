"use strict";

const { combineReducers } = require("redux");
const reducers = require("../reducers");
const actions = require("../actions");
const constants = require("../constants");
const configureStore = require("../create-store");
const queries = require("../queries");

const mockThreadClient = {
};

const _createStore = configureStore({
  log: false,
  makeThunkArgs: args => {
    return Object.assign({}, args, { threadClient: mockThreadClient });
  }
});

function createStore() {
  return _createStore(combineReducers(reducers));
}

function commonLog(msg, data) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

module.exports = { createStore, actions, queries, constants, commonLog };
