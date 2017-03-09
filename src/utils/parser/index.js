// @flow

const { workerTask } = require("../worker");
const { getValue } = require("devtools-config");

let worker;

function restartWorker() {
  if (worker) {
    worker.terminate();
  }

  worker = new Worker(`${getValue("baseWorkerURL")}parser-worker.js`);
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

module.exports = {
  getSymbols,
  getVariablesInScope,
  destroyWorker
};
