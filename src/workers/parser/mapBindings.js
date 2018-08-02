/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parseScript } from "./utils/ast";
import { isTopLevel } from "./utils/helpers";

import generate from "@babel/generator";
import * as t from "@babel/types";

// translates new bindings `var a = 3` into `self.a = 3`
// and existing bindings `var a = 3` into `a = 3` for re-assignments
function globalizeDeclaration(node, bindings) {
  return node.declarations.map(declaration => {
    const identifier = bindings.includes(declaration.id.name)
      ? declaration.id
      : t.memberExpression(t.identifier("self"), declaration.id);

    return t.expressionStatement(
      t.assignmentExpression("=", identifier, declaration.init)
    );
  });
}

// translates new bindings `a = 3` into `self.a = 3`
// and keeps assignments the same for existing bindings.
function globalizeAssignment(node, bindings) {
  if (bindings.includes(node.left.name)) {
    return node;
  }

  const identifier = t.memberExpression(t.identifier("self"), node.left);
  return t.assignmentExpression(node.operator, identifier, node.right);
}

function replaceNode(ancestors, node) {
  const parent = ancestors[ancestors.length - 1];

  if (typeof parent.index === "number") {
    if (Array.isArray(node)) {
      parent.node[parent.key].splice(parent.index, 1, ...node);
    } else {
      parent.node[parent.key][parent.index] = node;
    }
  } else {
    parent.node[parent.key] = node;
  }
}

function hasDestructuring(node) {
  return node.declarations.some(declaration => t.isPattern(declaration.id));
}

export default function mapExpressionBindings(
  expression: string,
  bindings: string[] = []
): string {
  const ast = parseScript(expression, { allowAwaitOutsideFunction: true });
  let shouldUpdate = true;
  t.traverse(ast, (node, ancestors) => {
    const parent = ancestors[ancestors.length - 1];

    if (t.isWithStatement(node)) {
      shouldUpdate = false;
      return;
    }

    if (!isTopLevel(ancestors)) {
      return;
    }

    if (t.isAssignmentExpression(node)) {
      if (t.isIdentifier(node.left)) {
        const newNode = globalizeAssignment(node, bindings);
        return replaceNode(ancestors, newNode);
      }

      if (t.isPattern(node.left)) {
        shouldUpdate = false;
        return;
      }
    }

    if (!t.isVariableDeclaration(node)) {
      return;
    }

    if (hasDestructuring(node)) {
      shouldUpdate = false;
      return;
    }

    if (!t.isForStatement(parent.node)) {
      const newNodes = globalizeDeclaration(node, bindings);
      replaceNode(ancestors, newNodes);
    }
  });

  if (!shouldUpdate) {
    return expression;
  }

  return generate(ast).code;
}
