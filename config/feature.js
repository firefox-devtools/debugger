"use strict";

const pick = require("lodash/get");

let config = typeof window != "undefined" ? DebuggerConfig : {};
const originalConfig = Object.assign({}, config);

/**
 * Gets a config value for a given key
 * e.g "chrome.webSocketPort"
 */
function getValue(key) {
  return pick(config, key);
}

const isEnabled = getValue;

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function isFirefoxPanel() {
  return process.env.TARGET == "firefox-panel";
}

function isFirefox() {
  return /firefox/i.test(navigator.userAgent)
}

// only used for testing purposes
function setConfig(stub) {
  config = stub;
}

function getConfig() {
  return config;
}

module.exports = {
  isEnabled,
  getValue,
  isDevelopment,
  isFirefoxPanel,
  isFirefox,
  getConfig,
  setConfig
};
