// @flow

/**
 * Utils for Jest
 * @module utils/test-head
 */

import { combineReducers } from "redux";
import sourceMaps from "devtools-source-map";
import reducers from "../reducers";
import actions from "../actions";
import selectors from "../selectors";

import configureStore from "../utils/create-store";

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

function makeFuncLocation(startLine) {
  return {
    start: {
      line: startLine
    }
  };
}

function makeSymbolDeclaration(name, line) {
  return {
    id: `${name}:${line}`,
    name,
    location: makeFuncLocation(line)
  };
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

export {
  actions,
  selectors,
  reducers,
  createStore,
  commonLog,
  makeSource,
  makeSymbolDeclaration,
  waitForState
};
