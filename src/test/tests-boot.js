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

const path = require("path");
const getConfig = require("../../bin/getConfig");
const setConfig = require("devtools-config").setConfig;

const baseWorkerURL = path.join(__dirname, "../../assets/build/");

const envConfig = getConfig();
setConfig(Object.assign({}, envConfig, {
  baseWorkerURL,
  sourceMapWorkerURL: path.join(baseWorkerURL, "source-map-worker.js"),
}));

