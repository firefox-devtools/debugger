// @flow

const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const tabs = require("./tabs");
const pause = require("./pause");
const navigation = require("./navigation");
const ui = require("./ui");

module.exports = (Object.assign(
  navigation,
  breakpoints, eventListeners, sources, tabs, pause, ui
) : typeof breakpoints);
