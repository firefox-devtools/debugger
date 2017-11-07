/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import toPairs from "lodash/toPairs";
import uniq from "lodash/uniq";

import type { Scope } from "./types";

function getScopeVariables(scope: Scope) {
  const { bindings } = scope;

  return toPairs(bindings).map(([name, binding]) => ({
    name,
    references: binding.referencePaths
  }));
}

function getScopeChain(scope: Scope): Scope[] {
  const scopes = [];

  do {
    scopes.push(scope);
  } while ((scope = scope.parent));

  return scopes;
}

export function getVariablesInLocalScope(scope: Scope) {
  return getScopeVariables(scope);
}

export function getVariablesInScope(scope: Scope) {
  const scopes = getScopeChain(scope);
  const scopeVars = scopes.map(getScopeVariables);
  const vars = [{ name: "this" }, { name: "arguments" }]
    .concat(...scopeVars)
    .map(variable => variable.name);
  return uniq(vars);
}

export function isExpressionInScope(expression: string, scope?: Scope) {
  if (!scope) {
    return false;
  }

  const variables = getVariablesInScope(scope);
  const firstPart = expression.split(/\./)[0];
  return variables.includes(firstPart);
}
