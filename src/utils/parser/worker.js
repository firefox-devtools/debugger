import { getClosestExpression } from "./utils/closest";
import { getVariablesInScope } from "./scopes";
import getSymbols, { clearSymbols } from "./getSymbols";
import getOutOfScopeLocations from "./getOutOfScopeLocations";
import { getNextStep } from "./steps";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getClosestExpression,
  getOutOfScopeLocations,
  getSymbols,
  clearSymbols,
  getVariablesInScope,
  getNextStep
});
