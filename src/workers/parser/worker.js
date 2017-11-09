/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
import { isReactComponent } from "./frameworks";

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
  hasSyntaxError,
  isReactComponent
});
