const fs = require("fs");
const path = require("path");

const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");

const envConfig = getConfig();
feature.setConfig(envConfig);

const webpackConfig = require("../webpack.config");
let { app } = toolbox.startDevServer(envConfig, webpackConfig);

app.get("/integration", function(req, res) {
  res.sendFile(path.join(__dirname, "../src/test/integration/index.html"));
});

app.get("/integration/mocha.css", function(req, res) {
  res.sendFile(path.join(__dirname, "../node_modules/mocha/mocha.css"));
});

console.log("View debugger examples here:")
console.log("https://github.com/jasonLaster/debugger-examples")
