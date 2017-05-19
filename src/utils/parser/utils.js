// @flow

import * as babylon from "babylon";
import traverse from "babel-traverse";
import * as t from "babel-types";
import { isDevelopment } from "devtools-config";
import toPairs from "lodash/toPairs";
import isEmpty from "lodash/isEmpty";
import uniq from "lodash/uniq";
import { getAst, traverseAst } from "./utils/ast";
import { isFunction, isVariable } from "./utils/helpers";

import type { SourceText, Location, Frame, TokenResolution } from "../../types";

function getNodeValue(node) {
  if (t.isThisExpression(node)) {
    return "this";
  }

  return node.name;
}

function getMemberExpression(root) {
  function _getMemberExpression(node, expr) {
    if (t.isMemberExpression(node)) {
      expr = [node.property.name].concat(expr);
      return _getMemberExpression(node.object, expr);
    }

    if (t.isThisExpression(node)) {
      return ["this"].concat(expr);
    }
    return [node.name].concat(expr);
  }

  return _getMemberExpression(root, []);
}

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

/**
 * helps find member expressions on one line and function scopes that are
 * often many lines
 */
function nodeContainsLocation({ node, location }) {
  const { start, end } = node.loc;
  const { line, column } = location;

  if (start.line === end.line) {
    return (
      start.line === line && start.column <= column && end.column >= column
    );
  }

  // node is likely a function parameter
  if (start.line === line) {
    return start.column <= column;
  }

  // node is on the same line as the closing curly
  if (end.line === line) {
    return end.column >= column;
  }

  // node is either inside the block body or outside of it
  return start.line < line && end.line > line;
}

function isLexicalScope(path) {
  return t.isBlockStatement(path) || isFunction(path) || t.isProgram(path);
}

function getClosestMemberExpression(source, token, location) {
  let expression = null;
  traverseAst(source, {
    enter(path) {
      const { node } = path;
      if (
        t.isMemberExpression(node) &&
        node.property.name === token &&
        nodeContainsLocation({ node, location })
      ) {
        const memberExpression = getMemberExpression(node);
        expression = {
          value: memberExpression.join("."),
          location: node.loc
        };
      }
    }
  });

  return expression;
}

export function getClosestExpression(
  source: SourceText,
  token: string,
  location: Location
) {
  const memberExpression = getClosestMemberExpression(source, token, location);
  if (memberExpression) {
    return memberExpression;
  }

  const path = getClosestPath(source, location);
  if (!path || !path.node) {
    return;
  }

  const { node } = path;
  return { value: getNodeValue(node), location: node.loc };
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

export function getClosestScope(source: SourceText, location: Location) {
  const ast = getAst(source);
  if (isEmpty(ast)) {
    return null;
  }

  let closestPath = null;

  traverse(ast, {
    enter(path) {
      if (
        isLexicalScope(path) &&
        nodeContainsLocation({ node: path.node, location })
      ) {
        closestPath = path;
      }
    }
  });

  if (!closestPath) {
    return;
  }

  return closestPath.scope;
}

export function getClosestPath(source: SourceText, location: Location) {
  const ast = getAst(source);
  if (isEmpty(ast)) {
    return null;
  }

  let closestPath = null;

  traverse(ast, {
    enter(path) {
      if (nodeContainsLocation({ node: path.node, location })) {
        closestPath = path;
      }
    }
  });

  return closestPath;
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
