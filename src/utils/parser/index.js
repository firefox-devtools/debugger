// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();
export const startParserWorker = dispatcher.start.bind(dispatcher);
export const stopParserWorker = dispatcher.stop.bind(dispatcher);

export const getClosestExpression = dispatcher.task("getClosestExpression");
export const getSymbols = dispatcher.task("getSymbols");
export const getVariablesInScope = dispatcher.task("getVariablesInScope");
export const getOutOfScopeLocations = dispatcher.task("getOutOfScopeLocations");
export const clearSymbols = dispatcher.task("clearSymbols");
export const getNextStep = dispatcher.task("getNextStep");

export type { SymbolDeclaration, SymbolDeclarations } from "./getSymbols";
export type { AstLocation } from "./types";
