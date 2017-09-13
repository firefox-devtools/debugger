import { getClosestExpression } from "./utils/closest";
import { getVariablesInScope } from "./scopes";
import getSymbols, { clearSymbols } from "./getSymbols";
import { clearASTs } from "./utils/ast";
import { hasSource, setSource, clearSources } from "./sources";
import getOutOfScopeLocations from "./getOutOfScopeLocations";
import { getNextStep } from "./steps";
import getEmptyLines from "./getEmptyLines";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getClosestExpression,
  getOutOfScopeLocations,
  getSymbols,
  clearSymbols,
  clearASTs,
  hasSource,
  setSource,
  clearSources,
  getVariablesInScope,
  getNextStep,
  getEmptyLines
});
