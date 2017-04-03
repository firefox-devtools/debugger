const {
  getSymbols,
  getVariablesInScope,
  getExpression,
  resolveToken,
} = require("./utils");

const { workerHandler } = require("../worker");

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  getExpression,
  resolveToken,
});
