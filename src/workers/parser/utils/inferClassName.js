/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import * as t from "babel-types";
import type { NodePath } from "babel-traverse";

// the function class is inferred from a call like
// createClass or extend
function fromCallExpression(callExpression) {
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

  const variable = callExpression.findParent(_p => _p.isVariableDeclarator());
  if (variable) {
    return variable.node.id.name;
  }

  const assignment = callExpression.findParent(_p =>
    _p.isAssignmentExpression()
  );

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
function fromPrototype(assignment) {
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

// infer class finds an appropriate class for functions
// that are defined inside of a class like thing.
// e.g. `class Foo`, `TodoClass.prototype.foo`,
//      `Todo = createClass({ foo: () => {}})`
export function inferClassName(path: NodePath): ?string {
  const classDeclaration = path.findParent(_p => _p.isClassDeclaration());
  if (classDeclaration) {
    return classDeclaration.node.id.name;
  }

  const callExpression = path.findParent(_p => _p.isCallExpression());
  if (callExpression) {
    return fromCallExpression(callExpression);
  }

  const assignment = path.findParent(_p => _p.isAssignmentExpression());
  if (assignment) {
    return fromPrototype(assignment);
  }

  return null;
}
