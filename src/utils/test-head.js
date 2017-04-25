// @flow

/**
 * Utils for Jest
 * @module utils/test-head
 */

const { combineReducers } = require("redux");
const sourceMaps = require("devtools-source-map");
import reducers from "../reducers";
const actions = require("../actions").default;
const selectors = require("../selectors");
import constants from "../constants";

const configureStore = require("../utils/create-store");

/**
 * @memberof utils/test-head
 * @static
 */
function createStore(client: any, initialState: any = {}) {
  return configureStore({
    log: false,
    makeThunkArgs: args => {
      return Object.assign({}, args, {
        client,
        sourceMaps
      });
    }
  })(combineReducers(reducers), initialState);
}

/**
 * @memberof utils/test-head
 * @static
 */
function commonLog(msg: string, data: any = {}) {
  console.log(`[INFO] ${msg} ${JSON.stringify(data)}`);
}

/**
 * @memberof utils/test-head
 * @static
 */
function makeSource(name: string, props: any = {}) {
  return Object.assign(
    {
      id: name,
      url: `http://localhost:8000/examples/${name}`
    },
    props
  );
}

/**
 * @memberof utils/test-head
 * @static
 */
function waitForState(store: any, predicate: any) {
  return new Promise(resolve => {
    const unsubscribe = store.subscribe(() => {
      if (predicate(store.getState())) {
        unsubscribe();
        resolve();
      }
    });
  });
}

module.exports = {
  actions,
  constants,
  selectors,
  reducers,
  createStore,
  commonLog,
  makeSource,
  waitForState
};
