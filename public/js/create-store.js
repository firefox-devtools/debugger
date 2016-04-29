/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { createStore, applyMiddleware } = require("redux");
const { thunk } = require("./util/thunk-middleware");
const { waitUntilService } = require("ff-devtools-libs/client/shared/redux/middleware/wait-service");
const { log } = require("ff-devtools-libs/client/shared/redux/middleware/log");
const { promise } = require("ff-devtools-libs/client/shared/redux/middleware/promise");
const { history } = require("ff-devtools-libs/client/shared/redux/middleware/history");

/**
 * This creates a dispatcher with all the standard middleware in place
 * that all code requires. It can also be optionally configured in
 * various ways, such as logging and recording.
 *
 * @param {object} opts:
 *        - log: log all dispatched actions to console
 *        - history: an array to store every action in. Should only be
 *                   used in tests.
 *        - middleware: array of middleware to be included in the redux store
 */
module.exports = (opts = {}) => {
  const middleware = [
    thunk(opts.makeThunkArgs),
    promise,

    // Order is important: services must go last as they always
    // operate on "already transformed" actions. Actions going through
    // them shouldn't have any special fields like promises, they
    // should just be normal JSON objects.
    waitUntilService
  ];

  if (opts.history) {
    middleware.push(history(opts.history));
  }

  if (opts.middleware) {
    opts.middleware.forEach(fn => middleware.push(fn));
  }

  if (opts.log) {
    middleware.push(log);
  }

  return applyMiddleware(...middleware)(createStore);
};
