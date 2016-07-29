"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const firefoxPanel = require("./firefox-panel.json");
const development = require("./development.json");

const localConfig = fs.existsSync(path.join(__dirname, "./local.json")) ?
  require("./local.json") : {};

let config = _.merge({}, development, localConfig);

function getConfig(target) {
  if(target === "firefox-panel") {
    return _.merge({}, firefoxPanel, localConfig);
  }
  return config;
}

module.exports = {
  getConfig
}
