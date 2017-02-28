const merge = require("lodash/merge");
const fs = require("fs");
const path = require("path");

function getConfig() {
  const applicationConfig = require("../configs/application.json");
  const firefoxConfig = require("../configs/firefox-panel.json");
  const developmentConfig = require("../configs/development.json");

  let localConfig = {};
  if (fs.existsSync(path.resolve(__dirname, "../configs/local.json"))) {
    localConfig = require("../configs/local.json");
  }

  if (process.env.TARGET === "firefox-panel") {
    return firefoxConfig;
  }

  const envConfig = process.env.TARGET === "application" ?
                  applicationConfig : developmentConfig;

  return merge({}, envConfig, localConfig);
}

module.exports = getConfig;
