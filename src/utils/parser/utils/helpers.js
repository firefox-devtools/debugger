import * as t from "babel-types";

type Scope = {
  location: {
    line: number,
    column: number
  },
  parent: Scope,
  bindings: Object[]
};

export function isLexicalScope(path) {
  return t.isBlockStatement(path) || isFunction(path) || t.isProgram(path);
}

export function isFunction(path) {
  return (
    t.isFunction(path) ||
    t.isArrowFunctionExpression(path) ||
    t.isObjectMethod(path) ||
    t.isClassMethod(path)
  );
}

export function isVariable(path) {
  return (
    t.isVariableDeclaration(path) ||
    (isFunction(path) && path.node.params.length) ||
    (t.isObjectProperty(path) && !isFunction(path.node.value))
  );
}

export function getMemberExpression(root) {
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
