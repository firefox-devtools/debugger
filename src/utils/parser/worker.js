import { getVariablesInScope } from "./scopes";
import getSymbols from "./getSymbols";
import resolveToken from "./resolveToken";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  resolveToken
});
