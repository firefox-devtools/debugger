// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();

const getClosestExpression = dispatcher.task("getClosestExpression");
const getSymbols = dispatcher.task("getSymbols");
const getVariablesInScope = dispatcher.task("getVariablesInScope");
const getOutOfScopeLocations = dispatcher.task("getOutOfScopeLocations");

export type { SymbolDeclaration, SymbolDeclarations } from "./getSymbols";
export type { AstLocation } from "./types";

module.exports = {
  getSymbols,
  getVariablesInScope,
  getOutOfScopeLocations,
  getClosestExpression,
  startParserWorker: dispatcher.start.bind(dispatcher),
  stopParserWorker: dispatcher.stop.bind(dispatcher)
};
