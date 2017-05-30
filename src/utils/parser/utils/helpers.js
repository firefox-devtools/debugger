// @flow

import * as t from "babel-types";
import type { NodePath, Node } from "babel-traverse";

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
