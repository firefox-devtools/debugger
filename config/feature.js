"use strict";

let config = typeof window != "undefined" ? window.debuggerConfig : {};
const _ = require("lodash");

function setConfig(conf) {
  config = conf;
}


/**
 * Gets a config value for a given key
 * e.g "chrome.webSocketPort"
 */
function getValue(key) {
  return _.get(config, key);
}

const isEnabled = getValue;

function isDevelopment() {
  return getValue("environment") == "development";
}

function isFirefoxPanel() {
  return getValue("environment") == "firefox-panel";
}

module.exports = {
  isEnabled,
  getValue,
  isDevelopment,
  isFirefoxPanel,
  setConfig
};
