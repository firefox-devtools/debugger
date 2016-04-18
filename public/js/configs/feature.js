"use strict";

let config = {};

const developmentConfig = require("./development");

// Hack, to let local development files be ignored by git
let localDevelopmentConfig;
try {
  localDevelopmentConfig = require("./development.local");
} catch (e) {
  localDevelopmentConfig = {};
}

config = Object.assign({}, developmentConfig, localDevelopmentConfig);

// only used for testing purposes
function stubConfig(stub) {
  config = stub;
}

function isEnabled(name) {
  return config[name];
}

function isDevelopment() {
  return isEnabled("development");
}

module.exports = {
  isEnabled,
  isDevelopment,
  stubConfig
};
