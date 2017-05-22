global.Worker = require("workerjs");
global.L10N = { getStr: value => value };

const path = require("path");
const getConfig = require("../../bin/getConfig");
const { setConfig } = require("devtools-config");

const rootPath = path.join(__dirname, "../../");

const envConfig = getConfig();
const config = Object.assign({}, envConfig, {
  workers: {
    sourceMapURL: path.join(
      rootPath,
      "node_modules/devtools-source-map/src/worker.js"
    ),
    parserURL: path.join(rootPath, "src/utils/parser/worker.js"),
    prettyPrintURL: path.join(rootPath, "src/utils/pretty-print/worker.js")
  }
});

global.DebuggerConfig = config;
setConfig(config);
