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

// translates new bindings `var a = 3` into `self.a = 3`
// and existing bindings `var a = 3` into `a = 3` for re-assignments
function globalizeDeclaration(node, bindings) {
  return node.declarations.reduce((body, declaration, i) => {
    if (t.isPattern(declaration.id)) {
      const varIdentifier = t.identifier(`__decl${i}__`);

      body.push(
        t.variableDeclaration("let", [
          t.variableDeclarator(varIdentifier, declaration.init)
        ])
      );

      for (const property of declaration.id.properties) {
        const identifier = getIdentifierName(property.value, bindings);

        body.push(
          t.assignmentExpression(
            "=",
            identifier,
            t.memberExpression(varIdentifier, property.key)
          )
        );
      }
    } else {
      const identifier = getIdentifierName(declaration.id, bindings);

      body.push(
        t.expressionStatement(
          t.assignmentExpression("=", identifier, declaration.init)
        )
      );
    }

    return body;
  }, []);
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

function hasNestedDestructuring(node) {
  return node.declarations.some(declaration =>
    t.isObjectPattern(declaration.value)
  );
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

      if (t.isPattern(node.left)) {
        shouldUpdate = false;
        return;
      }
    }

    if (!t.isVariableDeclaration(node)) {
      return;
    }

    if (hasNestedDestructuring(node)) {
      shouldUpdate = false;
      return;
    }

    // the isMapped check is to avoid processing the newly added nodes
    if (!t.isForStatement(parent.node) && !isMapped) {
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
