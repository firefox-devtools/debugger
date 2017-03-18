const { getSymbols, getVariablesInScope, getExpression } = require("./utils");

const { workerHandler } = require("../worker");

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  getExpression,
});
