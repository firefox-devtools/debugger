/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global window */

const React = require("react");
const { createStore, applyMiddleware, compose } = require("redux");
const { waitUntilService } = require("devtools/client/shared/redux/middleware/wait-service");
const { log } = require("devtools/client/shared/redux/middleware/log");
const { history } = require("./redux/middleware/history");
const { promise } = require("./redux/middleware/promise");
const { thunk } = require("./redux/middleware/thunk");

const { createDevTools } = require("redux-devtools");
const LogMonitor = React.createFactory(require("redux-devtools-log-monitor").default);
const DockMonitor = React.createFactory(require("redux-devtools-dock-monitor").default);
const { isEnabled } = require("../feature");

// createDevTools takes a monitor and produces a DevTools component
const DevTools = createDevTools(
  DockMonitor({
    toggleVisibilityKey: "ctrl-h",
    changePositionKey: "ctrl-q",
    defaultIsVisible: true
  },
    LogMonitor({ theme: "tomorrow" })
  )
);

function ReduxDevTools() {
  if (isEnabled("reduxDevtools.enabled")) {
    return React.createElement(DevTools);
  }

  return () => {};
}
ReduxDevTools.displayName = "ReduxDevTools";

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
const configureStore = (opts = {}) => {
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

  // Optionally add the Redux DevTools Extension, if it exists.
  const devtools = typeof window === "object" && window.devToolsExtension ?
    window.devToolsExtension() :
    f => f;

  if (!isEnabled("reduxDevtools.enabled")) {
    return applyMiddleware(...middleware)(devtools(createStore));
  }

  return compose(
    applyMiddleware(...middleware),
    DevTools.instrument()
  )(devtools(createStore));
};

module.exports = {
  configureStore,
  ReduxDevTools
};
