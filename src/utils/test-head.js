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
import { getHistory } from "../test/utils/history";
import configureStore from "../actions/utils/create-store";

/**
 * @memberof utils/test-head
 * @static
 */
function createStore(client: any, initialState: any = {}, sourceMapsMock: any) {
  return configureStore({
    log: false,
    history: getHistory(),
    makeThunkArgs: args => {
      return Object.assign({}, args, {
        client,
        sourceMaps: sourceMapsMock || sourceMaps
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
      loadedState: "loaded",
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

function makeSymbolDeclaration(name: string, line: number) {
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
  waitForState,
  getHistory
};
