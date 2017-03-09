const { getSymbols, getVariablesInScope } = require("./utils");

const { workerHandler } = require("../worker");

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope
});
