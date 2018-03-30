/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;

const dispatcher = new WorkerDispatcher();
export const startParserWorker = dispatcher.start.bind(dispatcher);
export const stopParserWorker = dispatcher.stop.bind(dispatcher);

export const getClosestExpression = dispatcher.task("getClosestExpression");
export const getSymbols = dispatcher.task("getSymbols");
export const getScopes = dispatcher.task("getScopes");
export const findOutOfScopeLocations = dispatcher.task(
  "findOutOfScopeLocations"
);
export const clearSymbols = dispatcher.task("clearSymbols");
export const clearScopes = dispatcher.task("clearScopes");
export const clearASTs = dispatcher.task("clearASTs");
export const getNextStep = dispatcher.task("getNextStep");
export const isInvalidPauseLocation = dispatcher.task("isInvalidPauseLocation");
export const hasSource = dispatcher.task("hasSource");
export const setSource = dispatcher.task("setSource");
export const clearSources = dispatcher.task("clearSources");
export const hasSyntaxError = dispatcher.task("hasSyntaxError");
export const mapOriginalExpression = dispatcher.task("mapOriginalExpression");
export const getFramework = dispatcher.task("getFramework");
export const getPausePoints = dispatcher.task("getPausePoints");
export const replaceOriginalVariableName = dispatcher.task(
  "replaceOriginalVariableName"
);

export type {
  SourceScope,
  BindingData,
  BindingLocation,
  BindingLocationType,
  BindingMetaValue,
  BindingType
} from "./getScopes";

export type { AstLocation, AstPosition, PausePoints } from "./types";

export type {
  ClassDeclaration,
  SymbolDeclaration,
  SymbolDeclarations,
  FunctionDeclaration
} from "./getSymbols";
