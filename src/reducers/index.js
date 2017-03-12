// @flow

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
  coverage: coverage.update
};
