// @flow

const { combineReducers } = require("redux");
const reducers = require("../reducers");
const actions = require("../actions");
const selectors = require("../selectors");
const constants = require("../constants");

const { configureStore } = require("../utils/create-store");

function createStore(client: any, initialState: any = {}) {
  return configureStore({
    log: false,
    makeThunkArgs: args => {
      return Object.assign({}, args, { client });
    }
  })(combineReducers(reducers), initialState);
}

function commonLog(msg: string, data: any = {}) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

module.exports = {
  actions, constants, selectors, reducers, createStore, commonLog
};
