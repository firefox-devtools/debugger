// @flow

import { workerUtils } from "devtools-utils";
import { getClosestExpression } from "./utils/closest";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();

const getSymbols = dispatcher.task("getSymbols");
const getVariablesInScope = dispatcher.task("getVariablesInScope");
const getOutOfScopeLocations = dispatcher.task("getOutOfScopeLocations");

module.exports = {
  getSymbols,
  getVariablesInScope,
  getOutOfScopeLocations,
  getClosestExpression,
  startParserWorker: dispatcher.start.bind(dispatcher),
  stopParserWorker: dispatcher.stop.bind(dispatcher)
};
