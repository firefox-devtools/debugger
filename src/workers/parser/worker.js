import { getClosestExpression } from "./utils/closest";
import { getVariablesInScope } from "./scopes";
import getSymbols, { clearSymbols } from "./getSymbols";
import { clearASTs } from "./utils/ast";
import getScopes, { clearScopes } from "./getScopes";
import { hasSource, setSource, clearSources } from "./sources";
import getOutOfScopeLocations from "./getOutOfScopeLocations";
import { getNextStep } from "./steps";
import getEmptyLines from "./getEmptyLines";
import { hasSyntaxError } from "./validate";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getClosestExpression,
  getOutOfScopeLocations,
  getSymbols,
  getScopes,
  clearSymbols,
  clearScopes,
  clearASTs,
  hasSource,
  setSource,
  clearSources,
  getVariablesInScope,
  getNextStep,
  getEmptyLines,
  hasSyntaxError
});
