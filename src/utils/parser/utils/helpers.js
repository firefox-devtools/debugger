// @flow

import * as t from "babel-types";
import type { NodePath, Node } from "babel-traverse";

import type { AstLocation, AstPosition } from "../types";

export function isLexicalScope(path: NodePath) {
  return t.isBlockStatement(path) || isFunction(path) || t.isProgram(path);
}

export function isFunction(path: NodePath) {
  return (
    t.isFunction(path) ||
    t.isArrowFunctionExpression(path) ||
    t.isObjectMethod(path) ||
    t.isClassMethod(path)
  );
}

export function isAwaitExpression(path: NodePath) {
  return (
    t.isAwaitExpression(path) ||
    t.isAwaitExpression(path.container.init) ||
    t.isAwaitExpression(path.parentPath)
  );
}

export function isVariable(path: NodePath) {
  return (
    t.isVariableDeclaration(path) ||
    (isFunction(path) && path.node.params.length) ||
    (t.isObjectProperty(path) && !isFunction(path.node.value))
  );
}

export function getMemberExpression(root: Node) {
  function _getMemberExpression(node, expr) {
    if (t.isMemberExpression(node)) {
      expr = [node.property.name].concat(expr);
      return _getMemberExpression(node.object, expr);
    }

    if (t.isCallExpression(node)) {
      return [];
    }

    if (t.isThisExpression(node)) {
      return ["this"].concat(expr);
    }

    return [node.name].concat(expr);
  }

  const expr = _getMemberExpression(root, []);
  return expr.join(".");
}

export function containsPosition(a: AstLocation, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line || (a.end.line === b.line && a.end.column >= b.column);

  return startsBefore && endsAfter;
}

export function containsLocation(a: AstLocation, b: AstLocation) {
  return containsPosition(a, b.start) && containsPosition(a, b.end);
}

export function nodeContainsPosition(node: Node, position: AstPosition) {
  return containsPosition(node.loc, position);
}
