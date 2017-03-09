// @flow

const { workerTask } = require("../utils");
const { getValue } = require("devtools-config");
const {
  getSymbols: getSymbolsUtil,
  getVariablesInScope: getVariablesInScopeUtil
} = require("./parser-utils");

const publicInterface = {
  getSymbolsUtil,
  getVariablesInScopeUtil
};

import type { Message } from "../../types";

self.onmessage = function(msg: Message) {
  const { id, method, args } = msg.data;
  const response = publicInterface[method].apply(null, args);

  if (response instanceof Promise) {
    response
      .then(val => self.postMessage({ id, response: val }))
      .catch(error => self.postMessage({ id, error }));
  } else {
    self.postMessage({ id, response });
  }
};

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

const getSymbols = workerTask(worker, "getSymbolsUtil");
const getVariablesInScope = workerTask(worker, "getVariablesInScopeUtil");

module.exports = {
  getSymbols,
  getVariablesInScope,
  destroyWorker
};
