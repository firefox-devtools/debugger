const getConfig = require("./src/config").getConfig;
const setConfig = require("./src/feature").setConfig;

function registerConfig() {
  setConfig(getConfig());
}

module.exports = {
  getConfig,
  registerConfig
}
