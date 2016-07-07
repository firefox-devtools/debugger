"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const envConfig = process.env.NODE_ENV === "DEVTOOLS_PANEL" ?
  require("./firefox-panel.json") : require("./development.json");

const localConfig = fs.existsSync(path.join(__dirname, "./local.json")) ?
  require("./local.json") : {};

let config = _.merge({}, envConfig, localConfig);
const originalConfig = Object.assign({}, config);

// only used for testing purposes
function stubConfig(stub) {
  config = stub;
}

function getConfig() {
  return config;
}

function resetConfig(stub) {
  config = originalConfig;
}

module.exports = {
  stubConfig,
  resetConfig,
  getConfig
}
