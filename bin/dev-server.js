const fs = require("fs");
const path = require("path");

const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");
const { mochaWebpackConfig, startMochaServer } = require("./mocha-server")


const envConfig = getConfig();
feature.setConfig(envConfig);

let webpackConfig = require("../webpack.config");
webpackConfig = mochaWebpackConfig(webpackConfig);

let { app } = toolbox.startDevServer(envConfig, webpackConfig, __dirname);

app.get("/integration", function(req, res) {
  res.sendFile(path.join(__dirname, "../src/test/integration/index.html"));
});

app.get("/integration/mocha.css", function(req, res) {
  res.sendFile(path.join(__dirname, "../node_modules/mocha/mocha.css"));
});

startMochaServer(app)

console.log("View debugger examples here:")
console.log("https://github.com/jasonLaster/debugger-examples")
