"use strict";

const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const firefoxPanel = require("./firefox-panel.json");
const development = require("./development.json");
const envConfig = process.env.TARGET === "firefox-panel" ?
   firefoxPanel : development;

const shouldDebugChrome = !!process.env.DEBUG_CHROME;

const localConfig = fs.existsSync(path.join(__dirname, "./local.json")) ?
  require("./local.json") : {};

let config = _.merge({}, envConfig, localConfig);

if (shouldDebugChrome) {
  config.chrome.debug = true;
}

function getConfig() {
  return config;
}

module.exports = {
  getConfig
};
