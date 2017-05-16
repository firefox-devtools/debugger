// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();

const getSymbols = dispatcher.task("getSymbols");
const getVariablesInScope = dispatcher.task("getVariablesInScope");
const resolveToken = dispatcher.task("resolveToken");

module.exports = {
  getSymbols,
  getVariablesInScope,
  resolveToken,
  startParserWorker: dispatcher.start.bind(dispatcher),
  stopParserWorker: dispatcher.stop.bind(dispatcher)
};
