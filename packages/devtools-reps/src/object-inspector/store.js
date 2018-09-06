/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/* global window */
const { thunk } = require("../shared/redux/middleware/thunk");
const {
  waitUntilService
} = require("../shared/redux/middleware/waitUntilService");

/**
 * Redux store utils
 * @module utils/create-store
 */

import { createStore, applyMiddleware } from "redux";

const configureStore = (opts: ReduxStoreOptions = {}) => {
  const middleware = [thunk(opts.thunkArgs), waitUntilService];
  return applyMiddleware(...middleware)(createStore);
};

export default configureStore;
