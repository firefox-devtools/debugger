/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "babel-types";

import { traverseAst } from "./ast";
import { isLexicalScope, getMemberExpression } from "./helpers";

import { nodeContainsPosition } from "./contains";

import type { Location } from "../../../types";
import type { NodePath, Node } from "babel-traverse";

function getNodeValue(node: Node) {
  if (t.isThisExpression(node)) {
    return "this";
  }

  return node.name;
}

function getClosestMemberExpression(sourceId, token, location: Location) {
  let expression = null;
  traverseAst(sourceId, {
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
  sourceId: string,
  token: string,
  location: Location
) {
  const memberExpression = getClosestMemberExpression(
    sourceId,
    token,
    location
  );
  if (memberExpression) {
    return memberExpression;
  }

  const path = getClosestPath(sourceId, location);
  if (!path || !path.node) {
    return;
  }

  const { node } = path;
  return { expression: getNodeValue(node), location: node.loc };
}

export function getClosestScope(sourceId: string, location: Location) {
  let closestPath = null;

  traverseAst(sourceId, {
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

export function getClosestPath(sourceId: string, location: Location) {
  let closestPath = null;

  traverseAst(sourceId, {
    enter(path) {
      if (!nodeContainsPosition(path.node, location)) {
        return path.skip();
      }
      closestPath = path;
    }
  });

  return closestPath;
}
