// @flow

import * as t from "babel-types";

import { traverseAst } from "./ast";
import {
  isLexicalScope,
  getMemberExpression,
  nodeContainsPosition
} from "./helpers";

import type { SourceText, Location } from "debugger-html";
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
      if (
        t.isMemberExpression(node) &&
        node.property.name === token &&
        nodeContainsPosition(node, location)
      ) {
        const memberExpression = getMemberExpression(node);
        expression = {
          value: memberExpression,
          location: node.loc
        };
      }
    }
  });

  return expression;
}

export function getClosestExpression(
  source: SourceText,
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
  return { value: getNodeValue(node), location: node.loc };
}

export function getClosestScope(source: SourceText, location: Location) {
  let closestPath = null;

  traverseAst(source, {
    enter(path) {
      if (isLexicalScope(path) && nodeContainsPosition(path.node, location)) {
        closestPath = path;
      }
    }
  });

  if (!closestPath) {
    return;
  }

  return closestPath.scope;
}

export function getClosestPath(source: SourceText, location: Location) {
  let closestPath = null;

  traverseAst(source, {
    enter(path) {
      if (nodeContainsPosition(path.node, location)) {
        closestPath = path;
      }
    }
  });

  return closestPath;
}
