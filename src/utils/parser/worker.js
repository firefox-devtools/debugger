import { getVariablesInScope, resolveToken } from "./utils";
import getSymbols from "./getSymbols";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  resolveToken
});
