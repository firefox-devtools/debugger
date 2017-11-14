/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "babel-types";

import { traverseAst } from "./ast";
import { isLexicalScope, getMemberExpression } from "./helpers";

import { nodeContainsPosition } from "./contains";

import type { Source, Location } from "debugger-html";
import type { NodePath, Node } from "babel-traverse";

function getNodeValue(node: Node) {
  if (t.isThisExpression(node)) {
    return "this";
  }

  return node.name;
}

function getClosestMemberExpression(source, token, location: Location) {
  let expression = null;
  traverseAst(source, {
    enter(path: NodePath) {
      const { node } = path;
      if (!nodeContainsPosition(node, location)) {
        return path.skip();
      }

      if (t.isMemberExpression(node) && node.property.name === token) {
        const memberExpression = getMemberExpression(node);
        expression = {
          expression: memberExpression,
          location: node.loc
        };
      }
    }
  });

  return expression;
}

export function getClosestExpression(
  source: Source,
  token: string,
  location: Location
) {
  const memberExpression = getClosestMemberExpression(source, token, location);
  if (memberExpression) {
    return memberExpression;
  }

  const path = getClosestPath(source, location);
  if (!path || !path.node) {
    return;
  }

  const { node } = path;
  return { expression: getNodeValue(node), location: node.loc };
}

export function getClosestScope(source: Source, location: Location) {
  let closestPath = null;

  traverseAst(source, {
    enter(path) {
      if (!nodeContainsPosition(path.node, location)) {
        return path.skip();
      }

      if (isLexicalScope(path)) {
        closestPath = path;
      }
    }
  });

  if (!closestPath) {
    return;
  }

  return closestPath.scope;
}

export function getClosestPath(source: Source, location: Location) {
  let closestPath = null;

  traverseAst(source, {
    enter(path) {
      if (!nodeContainsPosition(path.node, location)) {
        return path.skip();
      }
      closestPath = path;
    }
  });

  return closestPath;
}
