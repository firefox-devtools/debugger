/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defer = require("../../defer");
const { entries, toObject } = require("../../utils");
const { executeSoon } = require("../../DevToolsUtils");

const PROMISE = exports.PROMISE = "@@dispatch/promise";

let seqIdVal = 1;

function seqIdGen() {
  return seqIdVal++;
}

function promiseMiddleware({ dispatch, getState }) {
  return next => action => {
    if (!(PROMISE in action)) {
      return next(action);
    }

    // Mutate the action, removing the promise field and adding
    // the `seqId` field that represents the sequence id
    const { [PROMISE]: promiseInst, ...actionWithoutPromise } = action;
    action = {
      ...actionWithoutPromise,
      seqId: seqIdGen().toString(),
      status: "start",
    };
    dispatch(action);

    // Return the promise so action creators can still compose if they
    // want to.
    const deferred = defer();
    promiseInst.then(value => {
      executeSoon(() => {
        dispatch({
          ...action,
          status: "done",
          value,
        });
        deferred.resolve(value);
      });
    }, error => {
      executeSoon(() => {
        dispatch({
          ...action,
          status: "error",
          error: error.message || error,
        });
        deferred.reject(error);
      });
    });
    return deferred.promise;
  };
}

exports.promise = promiseMiddleware;
