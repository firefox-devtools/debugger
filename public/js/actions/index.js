"use strict";

const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const tabs = require("./tabs");
const pause = require("./pause");

module.exports = Object.assign(
  {}, breakpoints, eventListeners, sources, tabs, pause);
