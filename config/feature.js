"use strict";

let config = {};

const developmentConfig = require("./development.json");
config = Object.assign({}, developmentConfig);

try {
  const localConfig = require("./local.json");
  config = Object.assign(config, localConfig);
}
catch(e) {
  // local config does not exist, ignore it
}

// only used for testing purposes
function setConfig(_config) {
  const prevConfig = config;
  config = _config;
  return config;
}

function getConfig() {
  return config;
}

/**
 * Checks to see if a feature is enabled in the config.
 */
function isEnabled(name) {
  return getPath(name, config);
}

/**
 * Gets a config value for a given key
 * e.g "chrome.webSocketPort"
 */
function getValue(key) {
  return getPath(key, config);
}

function isDevelopment() {
  return isEnabled("development");
}

function getPath(path, parentObj) {
  const keys = path.split(".");
  return keys.reduce((obj, key) => obj[key], parentObj);
}

module.exports = {
  isEnabled,
  getValue,
  isDevelopment,
  setConfig,
  getConfig
};
