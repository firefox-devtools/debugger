// @flow

import traverse from "babel-traverse";
import * as t from "babel-types";
import toPairs from "lodash/toPairs";
import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";

import { getAst, traverseAst } from "./utils/ast";
import { isFunction, isVariable } from "./utils/helpers";
import { getClosestExpression, getClosestScope } from "./utils/closest";

import type { SourceText, Location, Frame, TokenResolution } from "../../types";
type Scope = {
  location: {
    line: number,
    column: number
  },
  parent: Scope,
  bindings: Object[]
};

function getScopeVariables(scope: Scope) {
  const { bindings } = scope;

  return toPairs(bindings).map(([name, binding]) => ({
    name,
    references: binding.referencePaths
  }));
}

function getScopeChain(scope: Scope): Scope[] {
  const scopes = [scope];

  do {
    scopes.push(scope);
  } while ((scope = scope.parent));

  return scopes;
}

// Resolves a token (at location) in the source to determine if it is in scope
// of the given frame and the expression (if any) to which it belongs
export function resolveToken(
  source: SourceText,
  token: string,
  location: Location,
  frame: Frame
): ?TokenResolution {
  const expression = getClosestExpression(source, token, location);
  const scope = getClosestScope(source, location);

  if (!expression || !expression.value || !scope) {
    return { expression: null, inScope: false };
  }

  const inScope = isExpressionInScope(expression.value, scope);

  return {
    expression,
    inScope
  };
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
