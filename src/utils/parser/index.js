// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();

const getSymbols = dispatcher.task("getSymbols");
const getVariablesInScope = dispatcher.task("getVariablesInScope");
const resolveToken = dispatcher.task("resolveToken");
const getOutOfScopeLocations = dispatcher.task("getOutOfScopeLocations");

module.exports = {
  getSymbols,
  getVariablesInScope,
  resolveToken,
  getOutOfScopeLocations,
  startParserWorker: dispatcher.start.bind(dispatcher),
  stopParserWorker: dispatcher.stop.bind(dispatcher)
};
