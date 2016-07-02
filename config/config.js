"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const envConfig = process.env.NODE_ENV === "DEVTOOLS_PANEL" ?
  require("./firefox-panel.json") : require("./development.json");

const localConfig = fs.existsSync(path.join(__dirname, "./local.json")) ?
  require("./local.json") : {};

let config = _.merge({}, envConfig, localConfig);

function getConfig() {
  return config;
}

module.exports = {
  getConfig
}
