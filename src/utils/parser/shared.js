import * as t from "babel-types";

type Scope = {
  location: {
    line: number,
    column: number
  },
  parent: Scope,
  bindings: Object[]
};

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
