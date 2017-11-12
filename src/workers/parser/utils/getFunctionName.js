/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import * as t from "babel-types";
import type { NodePath } from "babel-traverse";

export default function getFunctionName(path: NodePath): string {
  if (path.node.id) {
    return path.node.id.name;
  }

  if (path.type === "MethodDefinition") {
    return path.node.key.name;
  }

  const parent = path.parent;
  if (parent.type == "ObjectProperty") {
    return parent.key.name;
  }

  if (parent.type == "ObjectExpression" || path.node.type == "ClassMethod") {
    return path.node.key.name;
  }

  if (parent.type == "VariableDeclarator") {
    return parent.id.name;
  }

  if (parent.type == "AssignmentExpression") {
    if (parent.left.type == "MemberExpression") {
      return parent.left.property.name;
    }

    return parent.left.name;
  }

  if (t.isClassProperty(parent) && t.isArrowFunctionExpression(path)) {
    return parent.key.name;
  }

  return "anonymous";
}
