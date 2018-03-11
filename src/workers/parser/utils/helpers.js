/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "@babel/types";
import type { Node } from "@babel/types";
import type { SimplePath } from "./simple-path";

export function isFunction(node: Node) {
  return (
    t.isFunction(node) ||
    t.isArrowFunctionExpression(node) ||
    t.isObjectMethod(node) ||
    t.isClassMethod(node)
  );
}

export function isAwaitExpression(path: SimplePath) {
  const { node, parent } = path;
  return (
    t.isAwaitExpression(node) ||
    (t.isAwaitExpression(parent.init) || t.isAwaitExpression(parent))
  );
}

export function isYieldExpression(path: SimplePath) {
  const { node, parent } = path;
  return (
    t.isYieldExpression(node) ||
    (t.isYieldExpression(parent.init) || t.isYieldExpression(parent))
  );
}

export function isVariable(path: SimplePath) {
  const node = path.node;
  return (
    t.isVariableDeclaration(node) ||
    (isFunction(path) && path.node.params != null && path.node.params.length) ||
    (t.isObjectProperty(node) && !isFunction(path.node.value))
  );
}

export function isComputedExpression(expression: string): Boolean {
  return /^\[/m.test(expression);
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

export function getVariables(dec: Node) {
  if (!dec.id) {
    return [];
  }

  if (t.isArrayPattern(dec.id)) {
    if (!dec.id.elements) {
      return [];
    }

    // NOTE: it's possible that an element is empty
    // e.g. const [, a] = arr
    return dec.id.elements.filter(element => element).map(element => {
      return {
        name: t.isAssignmentPattern(element)
          ? element.left.name
          : element.name || element.argument.name,
        location: element.loc
      };
    });
  }

  return [
    {
      name: dec.id.name,
      location: dec.loc
    }
  ];
}
