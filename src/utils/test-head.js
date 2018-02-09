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
import * as selectors from "../selectors";
import { getHistory } from "../test/utils/history";
import configureStore from "../actions/utils/create-store";
import * as I from "immutable";

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

function makeFrame({ id, sourceId }: Object, opts: Object = {}) {
  return { id, scope: [], location: { sourceId, line: 4 }, ...opts };
}

/**
 * @memberof utils/test-head
 * @static
 */
function makeSource(name: string, props: any = {}) {
  return {
    id: name,
    loadedState: "unloaded",
    url: `http://localhost:8000/examples/${name}`,
    ...props
  };
}

function makeOriginalSource(name: string, props?: Object) {
  const source = makeSource(name, props);
  return { ...source, id: `${name}-original` };
}

function makeSourceRecord(name: string, props: any = {}) {
  return I.Map(makeSource(name, props));
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
    let ret = predicate(store.getState());
    if (ret) {
      resolve(ret);
    }

    const unsubscribe = store.subscribe(() => {
      ret = predicate(store.getState());
      if (ret) {
        unsubscribe();
        resolve(ret);
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
  makeFrame,
  makeSource,
  makeOriginalSource,
  makeSourceRecord,
  makeSymbolDeclaration,
  waitForState,
  getHistory
};
