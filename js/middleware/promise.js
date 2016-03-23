/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {
  entries, toObject, executeSoon
} = require("devtools/shared/DevToolsUtils");
const PROMISE = exports.PROMISE = "@@dispatch/promise";
let SEQ_ID = 0;

function promiseMiddleware ({ dispatch, getState }) {
  return next => action => {
    if (!(PROMISE in action)) {
      return next(action);
    }

    const promiseInst = action[PROMISE];
    const seqId = SEQ_ID++;

    // Create a new action that doesn't have the promise field and has
    // the `seqId` field that represents the sequence id
    action = Object.assign(
      toObject(entries(action).filter(pair => pair[0] !== PROMISE)), { seqId }
    );

    dispatch(Object.assign({}, action, { status: "start" }));

    // Return the promise so action creators can still compose if they
    // want to.
    return new Promise((resolve, reject) => {
      promiseInst.then(value => {
        executeSoon(() => {
          dispatch(Object.assign({}, action, {
            status: "done",
            value: value
          }));
          resolve(value);
        });
      }, error => {
        executeSoon(() => {
          dispatch(Object.assign({}, action, {
            status: "error",
            error: error.message || error
          }));
          reject(error);
        });
      });
    });
  };
}

exports.promise = promiseMiddleware;
