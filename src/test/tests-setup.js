function localStorage() {
  let storage = {};

  return {
    setItem: function(key, value) {
      storage[key] = value || "";
    },
    getItem: function(key) {
      return storage[key] || null;
    },
    removeItem: function(key) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: function(i) {
      let keys = Object.keys(storage);
      return keys[i] || null;
    }
  };
}

global.localStorage = localStorage();
global.Worker = require("workerjs");

global.L10N = { getStr: () => {} };

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
