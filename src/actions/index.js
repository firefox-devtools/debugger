// @flow

const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const pause = require("./pause");
const navigation = require("./navigation");
const ui = require("./ui");
const coverage = require("./coverage");

module.exports = (Object.assign(
  navigation,
  breakpoints,
  eventListeners,
  sources,
  pause,
  ui,
  coverage
) : typeof breakpoints);
