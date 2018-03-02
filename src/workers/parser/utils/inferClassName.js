/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import * as t from "@babel/types";
// import type { NodePath } from "@babel/traverse";

// the function class is inferred from a call like
// createClass or extend
function fromCallExpression(callExpression, ...ancestors) {
  const whitelist = ["extend", "createClass"];
  const callee = callExpression.node.callee;
  if (!callee) {
    return null;
  }

  const name = t.isMemberExpression(callee)
    ? callee.property.name
    : callee.name;

  if (!whitelist.includes(name)) {
    return null;
  }

  const variable = findParent(ancestors, t.isVariableDeclarator);
  if (variable) {
    return variable.node.id.name;
  }

  const assignment = findParent(ancestors, t.isAssignmentExpression);

  if (!assignment) {
    return null;
  }

  const left = assignment.node.left;

  if (left.name) {
    return name;
  }

  if (t.isMemberExpression(left)) {
    return left.property.name;
  }

  return null;
}

// the function class is inferred from a prototype assignment
// e.g. TodoClass.prototype.render = function() {}
function fromPrototype(assignment, ...ancestors) {
  const left = assignment.node.left;
  if (!left) {
    return null;
  }

  if (
    t.isMemberExpression(left) &&
    left.object &&
    t.isMemberExpression(left.object) &&
    left.object.property.identifier === "prototype"
  ) {
    return left.object.object.name;
  }

  return null;
}

function findParent(ancestors, predicate) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (predicate(ancestor)) {
      return ancestor;
    }
  }

  return null;
}

function hasParent(ancestors, predicate) {
  return !!findParent(ancestors, predicate);
}

function findAncestors(ancestors, predicate) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i].node;
    if (predicate(ancestor)) {
      return ancestors.slice(i);
    }
  }

  return null;
}

// infer class finds an appropriate class for functions
// that are defined inside of a class like thing.
// e.g. `class Foo`, `TodoClass.prototype.foo`,
//      `Todo = createClass({ foo: () => {}})`
export function inferClassName(node: NodePath, ancestors): ?string {
  if (hasParent(ancestors, t.isClassDeclaration)) {
    const [classDeclaration] = findAncestors(ancestors, t.isClassDeclaration);
    return classDeclaration.node.id.name;
  }

  if (hasParent(ancestors, t.isCallExpression)) {
    return fromCallExpression(findAncestors(ancestors, t.isCallExpression));
  }

  if (hasParent(ancestors, t.isAssignmentExpression)) {
    return fromPrototype(findAncestors(ancestors, t.isAssignmentExpression));
  }

  return null;
}
