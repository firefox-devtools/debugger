"use strict";

const constants = require("../constants");
const breakpoints = require("./breakpoints");
const eventListeners = require("./event-listeners");
const sources = require("./sources");
const tabs = require("./tabs");
const pause = require("./pause");

function willNavigate() {
  return { type: constants.NAVIGATE };
}

function navigate() {
  return sources.loadSources();
}

module.exports = Object.assign(
  { willNavigate, navigate },
  breakpoints, eventListeners, sources, tabs, pause
);
