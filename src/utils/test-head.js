/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
      return {
        ...args,
        client,
        sourceMaps: sourceMapsMock || sourceMaps
      };
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
  return {
    id: name,
    loadedState: "loaded",
    url: `http://localhost:8000/examples/${name}`,
    ...props
  };
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
function waitForState(store: any, predicate: any): Promise<void> {
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
