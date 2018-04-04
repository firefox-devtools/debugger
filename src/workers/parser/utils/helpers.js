/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "@babel/types";
import type { Node } from "@babel/types";
import type { SimplePath } from "./simple-path";
import type { SymbolDeclaration } from "../index";
import generate from "@babel/generator";

import flatten from "lodash/flatten";

export function isFunction(node: Node) {
  return (
    t.isFunction(node) ||
    t.isArrowFunctionExpression(node) ||
    t.isObjectMethod(node) ||
    t.isClassMethod(node)
  );
}

export function isAwaitExpression(path: SimplePath) {
  const { node, parent } = path;
  return (
    t.isAwaitExpression(node) ||
    (t.isAwaitExpression(parent.init) || t.isAwaitExpression(parent))
  );
}

export function isYieldExpression(path: SimplePath) {
  const { node, parent } = path;
  return (
    t.isYieldExpression(node) ||
    (t.isYieldExpression(parent.init) || t.isYieldExpression(parent))
  );
}

export function isObjectShorthand(parent: Node): boolean {
  return (
    t.isProperty(parent) &&
    parent.key.start == parent.value.start &&
    parent.key.loc.identifierName === parent.value.loc.identifierName
  );
}

export function getObjectExpressionValue(node: Node) {
  const { value } = node;

  if (t.isIdentifier(value)) {
    return value.name;
  }

  if (t.isCallExpression(value)) {
    return "";
  }
  const code = generate(value).code;

  const shouldWrap = t.isObjectExpression(value);
  return shouldWrap ? `(${code})` : code;
}

export function getVariableNames(path: SimplePath): SymbolDeclaration[] {
  if (t.isObjectProperty(path.node) && !isFunction(path.node.value)) {
    if (path.node.key.type === "StringLiteral") {
      return [
        {
          name: path.node.key.value,
          location: path.node.loc
        }
      ];
    } else if (path.node.value.type === "Identifier") {
      return [{ name: path.node.value.name, location: path.node.loc }];
    } else if (path.node.value.type === "AssignmentPattern") {
      return [{ name: path.node.value.left.name, location: path.node.loc }];
    }

    return [
      {
        name: path.node.key.name,
        location: path.node.loc
      }
    ];
  }

  if (!path.node.declarations) {
    return path.node.params.map(dec => ({
      name: dec.name,
      location: dec.loc
    }));
  }

  const declarations = path.node.declarations
    .filter(dec => dec.id.type !== "ObjectPattern")
    .map(getVariables);

  return flatten(declarations);
}

export function getComments(ast: any) {
  if (!ast || !ast.comments) {
    return [];
  }
  return ast.comments.map(comment => ({
    name: comment.location,
    location: comment.loc
  }));
}

export function getSpecifiers(specifiers: any) {
  if (!specifiers) {
    return [];
  }

  return specifiers.map(specifier => specifier.local && specifier.local.name);
}

export function isVariable(path: SimplePath) {
  const node = path.node;
  return (
    t.isVariableDeclaration(node) ||
    (isFunction(path) && path.node.params != null && path.node.params.length) ||
    (t.isObjectProperty(node) && !isFunction(path.node.value))
  );
}

export function isComputedExpression(expression: string): boolean {
  return /^\[/m.test(expression);
}

export function getMemberExpression(root: Node) {
  function _getMemberExpression(node, expr) {
    if (t.isMemberExpression(node)) {
      expr = [node.property.name].concat(expr);
      return _getMemberExpression(node.object, expr);
    }

    if (t.isCallExpression(node)) {
      return [];
    }

    if (t.isThisExpression(node)) {
      return ["this"].concat(expr);
    }

    return [node.name].concat(expr);
  }

  const expr = _getMemberExpression(root, []);
  return expr.join(".");
}

export function getVariables(dec: Node) {
  if (!dec.id) {
    return [];
  }

  if (t.isArrayPattern(dec.id)) {
    if (!dec.id.elements) {
      return [];
    }

    // NOTE: it's possible that an element is empty
    // e.g. const [, a] = arr
    return dec.id.elements.filter(element => element).map(element => {
      return {
        name: t.isAssignmentPattern(element)
          ? element.left.name
          : element.name || element.argument.name,
        location: element.loc
      };
    });
  }

  return [
    {
      name: dec.id.name,
      location: dec.loc
    }
  ];
}
