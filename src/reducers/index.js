/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const expressions = require("./expressions");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const breakpoints = require("./breakpoints");
const asyncRequests = require("./async-requests");
const pause = require("./pause");
const ui = require("./ui");
const coverage = require("./coverage");

module.exports = {
  expressions: expressions.update,
  eventListeners: eventListeners.update,
  sources: sources.update,
  breakpoints: breakpoints.update,
  pause: pause.update,
  asyncRequests,
  ui: ui.update,
  coverage: coverage.update,
};
