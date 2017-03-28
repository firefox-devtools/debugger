// @flow

const { workerUtils: { workerTask } } = require("devtools-modules");
const { getValue } = require("devtools-config");

let worker;

function restartWorker() {
  if (worker) {
    worker.terminate();
  }

  worker = new Worker(getValue("workers.parserURL"));
}

restartWorker();

function destroyWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

const getSymbols = workerTask(worker, "getSymbols");
const getVariablesInScope = workerTask(worker, "getVariablesInScope");
const getExpression = workerTask(worker, "getExpression");

module.exports = {
  getSymbols,
  getVariablesInScope,
  getExpression,
  destroyWorker,
};
