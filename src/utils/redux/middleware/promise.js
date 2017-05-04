// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const defer = require("../../defer");
const toPairs = require("lodash/toPairs");
const fromPairs = require("lodash/fromPairs");
const { executeSoon } = require("../../DevToolsUtils");

import type { ThunkArgs } from "../../../actions/types";

const PROMISE = (exports.PROMISE = "@@dispatch/promise");
let seqIdVal = 1;

function seqIdGen() {
  return seqIdVal++;
}

function filterAction(action: Object): Object {
  return fromPairs(toPairs(action).filter(pair => pair[0] !== PROMISE));
}

function promiseMiddleware({ dispatch, getState }: ThunkArgs) {
  return (next: Function) =>
    (action: Object) => {
      if (!(PROMISE in action)) {
        return next(action);
      }

      const promiseInst = action[PROMISE];
      const seqId = seqIdGen().toString();

      // Create a new action that doesn't have the promise field and has
      // the `seqId` field that represents the sequence id
      action = Object.assign(filterAction(action), { seqId });

      dispatch(Object.assign({}, action, { status: "start" }));

      // Return the promise so action creators can still compose if they
      // want to.
      const deferred = defer();
      promiseInst.then(
        value => {
          executeSoon(() => {
            dispatch(
              Object.assign({}, action, {
                status: "done",
                value: value
              })
            );
            deferred.resolve(value);
          });
        },
        error => {
          executeSoon(() => {
            dispatch(
              Object.assign({}, action, {
                status: "error",
                error: error.message || error
              })
            );
            deferred.reject(error);
          });
        }
      );
      return deferred.promise;
    };
}

exports.promise = promiseMiddleware;
