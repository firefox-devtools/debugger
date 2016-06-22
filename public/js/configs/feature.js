"use strict";

const DevToolsUtils = require("devtools-sham/shared/DevToolsUtils");
const AppConstants = require("devtools-sham/sham/appconstants").AppConstants;

let config = {};

const developmentConfig = require("./development.json");
config = Object.assign({}, developmentConfig);
const originalConfig = Object.assign({}, developmentConfig);

// only used for testing purposes
function stubConfig(stub) {
  config = stub;
}

function resetConfig(stub) {
  config = originalConfig;
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

function isDevToolsPanel() {
  return process.env.NODE_ENV === "DEVTOOLS_PANEL";
}

function getPath(path, parentObj) {
  const keys = path.split(".");
  return keys.reduce((obj, key) => obj[key], parentObj);
}

function getTargetFromQuery() {
  const href = window.location.href;
  const nodeMatch = href.match(/ws=([^&#]*)/);
  const firefoxMatch = href.match(/firefox-tab=([^&#]*)/);
  const chromeMatch = href.match(/chrome-tab=([^&#]*)/);

  if (nodeMatch) {
    return { type: "node", param: nodeMatch[1] };
  } else if (firefoxMatch) {
    return { type: "firefox", param: firefoxMatch[1] };
  } else if (chromeMatch) {
    return { type: "chrome", param: chromeMatch[1] };
  }

  return null;
}

function setConfigs() {
  // Set various flags before requiring app code.
  if (isEnabled("clientLogging")) {
    DevToolsUtils.dumpn.wantLogging = true;
  }

  if (isEnabled("development")) {
    AppConstants.DEBUG_JS_MODULES = true;
  }
}

module.exports = {
  isEnabled,
  getValue,
  getTargetFromQuery,
  setConfigs,
  isDevelopment,
  isDevToolsPanel,
  stubConfig,
  resetConfig
};
