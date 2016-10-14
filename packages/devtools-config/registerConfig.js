const { getConfig } = require("./src/config")
const { setConfig } = require("./src/feature")

function registerConfig() {
  setConfig(getConfig());
}

module.exports = {
  getConfig,
  registerConfig
}
