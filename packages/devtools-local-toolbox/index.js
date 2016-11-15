const developmentServer = require("./bin/development-server");
const toolboxConfig = require("./webpack.config");

module.exports = {
  startDevServer: developmentServer.startDevServer,
  toolboxConfig
};
