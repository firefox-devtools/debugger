
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const firefoxPanel = require("../configs/firefox-panel.json");
const development = require("../configs/development.json");
const envConfig = process.env.TARGET === "firefox-panel" ?
   firefoxPanel : development;

function getConfig() {
  if (process.env.TARGET === "firefox-panel") {
    return firefoxPanel;
  }

  let projectPath = path.join(__dirname, "../../..");
  const configPath = path.resolve(projectPath, "config/local.json");

  const localConfig = fs.existsSync(configPath) ? require(configPath) : {};

  return _.merge({}, envConfig, localConfig);
}

module.exports = {
  getConfig
};
