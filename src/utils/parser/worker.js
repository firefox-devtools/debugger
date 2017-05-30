import { getVariablesInScope } from "./scopes";
import getSymbols from "./getSymbols";
import resolveToken from "./resolveToken";
import getOutOfScopeLocations from "./getOutOfScopeLocations";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getOutOfScopeLocations,
  getSymbols,
  getVariablesInScope,
  resolveToken
});
