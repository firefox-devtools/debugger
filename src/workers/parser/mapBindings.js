/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parseScript } from "./utils/ast";
import { isTopLevel } from "./utils/helpers";

import generate from "@babel/generator";
import * as t from "@babel/types";

function getIdentifierName(identifier, bindings) {
  return bindings.includes(identifier.name)
    ? identifier
    : t.memberExpression(t.identifier("self"), identifier);
}

export function globalizeObjectDestructuring(node, bindings) {
  for (const property of node.properties) {
    if (t.isIdentifier(property.value)) {
      property.value = getIdentifierName(property.value, bindings);
    } else if (
      t.isAssignmentPattern(property.value) &&
      t.isIdentifier(property.value.left)
    ) {
      property.value.left = getIdentifierName(property.value.left, bindings);
    }
  }
}

// translates new bindings `var a = 3` into `self.a = 3`
// and existing bindings `var a = 3` into `a = 3` for re-assignments
function globalizeDeclaration(node, bindings) {
  return node.declarations.map(declaration => {
    if (t.isPattern(declaration.id)) {
      return t.expressionStatement(
        t.assignmentExpression("=", declaration.id, declaration.init)
      );
    }

    const identifier = getIdentifierName(declaration.id, bindings);

    return t.expressionStatement(
      t.assignmentExpression("=", identifier, declaration.init)
    );
  });
}

function globalizeArrayDestructuring(node, bindings) {
  for (const [i, element] of node.elements.entries()) {
    if (t.isIdentifier(element)) {
      node.elements[i] = getIdentifierName(element, bindings);
    }
  }
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

export default function mapExpressionBindings(
  expression: string,
  bindings: string[] = []
): string {
  const ast = parseScript(expression, { allowAwaitOutsideFunction: true });
  let isMapped = false;
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
        isMapped = true;
        return replaceNode(ancestors, newNode);
      }

      return;
    }

    if (t.isObjectPattern(node)) {
      globalizeObjectDestructuring(node, bindings);
      isMapped = true;
      return;
    }

    if (t.isArrayPattern(node)) {
      globalizeArrayDestructuring(node, bindings);
      isMapped = true;
      return;
    }

    if (!t.isVariableDeclaration(node)) {
      return;
    }

    if (!t.isForStatement(parent.node)) {
      const newNodes = globalizeDeclaration(node, bindings);
      isMapped = true;
      replaceNode(ancestors, newNodes);
    }
  });

  if (!shouldUpdate || !isMapped) {
    return expression;
  }

  return generate(ast).code;
}
