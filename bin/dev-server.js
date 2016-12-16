const fs = require("fs");
const path = require("path");

const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");

const envConfig = getConfig();
feature.setConfig(envConfig);

const webpackConfig = require("../webpack.config");
toolbox.startDevServer(envConfig, webpackConfig);

console.log("View debugger examples here:")
console.log("https://github.com/jasonLaster/debugger-examples")
