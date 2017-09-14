// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();
export const startParserWorker = dispatcher.start.bind(dispatcher);
export const stopParserWorker = dispatcher.stop.bind(dispatcher);

export const getClosestExpression = dispatcher.task("getClosestExpression");
export const getSymbols = dispatcher.task("getSymbols");
export const getScopes = dispatcher.task("getScopes");
export const getVariablesInScope = dispatcher.task("getVariablesInScope");
export const getOutOfScopeLocations = dispatcher.task("getOutOfScopeLocations");
export const clearSymbols = dispatcher.task("clearSymbols");
export const clearScopes = dispatcher.task("clearScopes");
export const clearASTs = dispatcher.task("clearASTs");
export const getNextStep = dispatcher.task("getNextStep");
export const getEmptyLines = dispatcher.task("getEmptyLines");
export const hasSource = dispatcher.task("hasSource");
export const setSource = dispatcher.task("setSource");
export const clearSources = dispatcher.task("clearSources");

export type { SymbolDeclaration, SymbolDeclarations } from "./getSymbols";
export type { AstLocation } from "./types";
