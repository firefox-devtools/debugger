"use strict";

const { combineReducers } = require("redux");
const reducers = require("../reducers");
const configureStore = require("../create-store");

let mockThreadClient;

const _createStore = configureStore({
  log: false,
  makeThunkArgs: args => {
    return Object.assign({}, args, { threadClient: mockThreadClient });
  }
});

function createStore(threadClient) {
  mockThreadClient = threadClient;
  return _createStore(combineReducers(reducers));
}

function commonLog(msg, data = {}) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

module.exports = { createStore, commonLog };
