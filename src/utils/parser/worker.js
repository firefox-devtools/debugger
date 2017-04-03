const {
  getSymbols,
  getVariablesInScope,
  resolveToken,
} = require("./utils");

const { workerHandler } = require("../worker");

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  resolveToken,
});
