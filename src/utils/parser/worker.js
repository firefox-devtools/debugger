import { getSymbols, getVariablesInScope, resolveToken } from "./utils";

import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({
  getSymbols,
  getVariablesInScope,
  resolveToken
});
