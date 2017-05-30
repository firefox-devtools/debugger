// @flow

import * as t from "babel-types";

import { traverseAst } from "./ast";
import { isLexicalScope, getMemberExpression } from "./helpers";

import type { SourceText, Location } from "debugger-html";
import type { NodePath, Node } from "babel-traverse";

function getNodeValue(node: Node) {
  if (t.isThisExpression(node)) {
    return "this";
  }

  return node.name;
}

/**
 * helps find member expressions on one line and function scopes that are
 * often many lines
 */
type nodeContainsLocationParams = {
  node: Node,
  location: Location
};

function nodeContainsLocation({ node, location }: nodeContainsLocationParams) {
  const { start, end } = node.loc;
  const { line, column } = location;

  // node is a one line expression
  if (start.line === end.line) {
    return (
      start.line === line && start.column <= column && end.column >= column
    );
  }

  // node is likely a function parameter
  if (start.line === line) {
    return start.column <= column;
  }

  // node is on the same line as the closing curly
  if (end.line === line) {
    return end.column >= column;
  }

  // node is either inside the block body or outside of it
  return start.line < line && end.line > line;
}

function getClosestMemberExpression(source, token, location: Location) {
  let expression = null;
  traverseAst(source, {
    enter(path: NodePath) {
      const { node } = path;
      if (
        t.isMemberExpression(node) &&
        node.property.name === token &&
        nodeContainsLocation({ node, location })
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
      if (
        isLexicalScope(path) &&
        nodeContainsLocation({ node: path.node, location })
      ) {
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
      if (nodeContainsLocation({ node: path.node, location })) {
        closestPath = path;
      }
    }
  });

  return closestPath;
}
