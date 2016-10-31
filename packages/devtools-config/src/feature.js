// @flow

const pick = require("lodash/get");
let config;

const flag = require("./test-flag");

/**
 * Gets a config value for a given key
 * e.g "chrome.webSocketPort"
 */
function getValue(key: string) {
  return pick(config, key);
}

function isEnabled(key: string) {
  return config.features[key];
}

function isDevelopment() {
  if (isFirefoxPanel()) {
    // Default to production if compiling for the Firefox panel
    return process.env.NODE_ENV === "development";
  }
  return process.env.NODE_ENV !== "production";
}

function isTesting() {
  return flag.testing;
}

function isFirefoxPanel() {
  return process.env.TARGET == "firefox-panel";
}

function isFirefox() {
  return /firefox/i.test(navigator.userAgent);
}

function setConfig(value: Object) {
  config = value;
}

function getConfig() {
  return config;
}

module.exports = {
  isEnabled,
  getValue,
  isDevelopment,
  isTesting,
  isFirefoxPanel,
  isFirefox,
  getConfig,
  setConfig
};
