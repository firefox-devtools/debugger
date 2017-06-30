// @flow

import * as t from "babel-types";

import { traverseAst } from "./ast";
import {
  isLexicalScope,
  getMemberExpression,
  nodeContainsPosition,
  nodeContainsLine
} from "./helpers";

import type { SourceText, Location } from "debugger-html";
import type { NodePath, Node } from "babel-traverse";

export function getNodeValue(node: Node) {
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
  return { expression: getNodeValue(node), location: node.loc };
}

export function getClosestScope(source: SourceText, location: Location) {
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

export function getClosestPath(source: SourceText, location: Location) {
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

export function getClosestNode(source, astLocation) {
  let closestPath = null;

  function containsCandidate(node, candidate) {
    return node.body.includes(
      n => n.name === candidate.name && n.type === candidate.type
    );
  }

  const { closestNode, candidate } = astLocation;

  traverseAst(source, {
    enter(path) {
      if (path.node.name === candidate.name && path.node.type === candidate.type && path.parentPath.node.name === closestNode.name && path.parentPath.node.type === closestNode.type) {
        closestPath = path;
      }
    }
  });

  return closestPath;
}
