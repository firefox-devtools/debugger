/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import flatten from "lodash/flatten";
import * as t from "@babel/types";

import { traverseAst } from "./utils/ast";
import { isVariable, isFunction, getVariables } from "./utils/helpers";
import { inferClassName } from "./utils/inferClassName";
import getFunctionName from "./utils/getFunctionName";

// import type { NodePath, Node, Location as BabelLocation } from "babel-traverse";

let symbolDeclarations = new Map();

export type ClassDeclaration = {|
  name: string,
  location: BabelLocation,
  parent?: ClassDeclaration
|};

export type SymbolDeclaration = {|
  name: string,
  expression?: string,
  klass?: ?string,
  location: BabelLocation,
  expressionLocation?: BabelLocation,
  parameterNames?: string[],
  identifier?: Object,
  computed?: Boolean,
  values?: string[]
|};

export type FunctionDeclaration = SymbolDeclaration & {|
  parameterNames: string[]
|};

export type SymbolDeclarations = {
  classes: Array<ClassDeclaration>,
  functions: Array<SymbolDeclaration>,
  variables: Array<SymbolDeclaration>,
  memberExpressions: Array<SymbolDeclaration>,
  callExpressions: Array<SymbolDeclaration>,
  objectProperties: Array<SymbolDeclaration>,
  identifiers: Array<SymbolDeclaration>,
  comments: Array<SymbolDeclaration>
};

function getFunctionParameterNames(node: NodePath): string[] {
  if (node.params != null) {
    return node.params.map(param => {
      if (param.type !== "AssignmentPattern") {
        return param.name;
      }

      // Parameter with default value
      if (
        param.left.type === "Identifier" &&
        param.right.type === "Identifier"
      ) {
        return `${param.left.name} = ${param.right.name}`;
      } else if (
        param.left.type === "Identifier" &&
        param.right.type === "StringLiteral"
      ) {
        return `${param.left.name} = ${param.right.value}`;
      } else if (
        param.left.type === "Identifier" &&
        param.right.type === "ObjectExpression"
      ) {
        return `${param.left.name} = {}`;
      } else if (
        param.left.type === "Identifier" &&
        param.right.type === "ArrayExpression"
      ) {
        return `${param.left.name} = []`;
      } else if (
        param.left.type === "Identifier" &&
        param.right.type === "NullLiteral"
      ) {
        return `${param.left.name} = null`;
      }
    });
  }
  return [];
}

function getVariableNames(node: NodePath): SymbolDeclaration[] {
  if (t.isObjectProperty(node) && !isFunction(node.value)) {
    if (node.key.type === "StringLiteral") {
      return [
        {
          name: node.key.value,
          location: node.loc
        }
      ];
    } else if (node.value.type === "Identifier") {
      return [{ name: node.value.name, location: node.loc }];
    } else if (node.value.type === "AssignmentPattern") {
      return [{ name: node.value.left.name, location: node.loc }];
    }

    return [
      {
        name: node.key.name,
        location: node.loc
      }
    ];
  }

  if (!node.declarations) {
    return node.params.map(dec => ({
      name: dec.name,
      location: dec.loc
    }));
  }

  const declarations = node.declarations
    .filter(dec => dec.id.type !== "ObjectPattern")
    .map(getVariables);

  return flatten(declarations);
}

function getComments(ast) {
  if (!ast || !ast.comments) {
    return [];
  }
  return ast.comments.map(comment => ({
    name: comment.location,
    location: comment.loc
  }));
}

function getSpecifiers(specifiers) {
  if (!specifiers) {
    return null;
  }

  return specifiers.map(specifier => specifier.local && specifier.local.name);
}

function extractSymbol(node, ancestors, symbols) {
  const ancestor = ancestors[ancestors.length - 1];
  const parent = ancestor ? ancestor.node : null;
  if (!parent) {
    return;
  }

  if (isVariable(node)) {
    symbols.variables.push(...getVariableNames(node));
  }

  if (isFunction(node)) {
    symbols.functions.push({
      name: getFunctionName(node, parent),
      klass: inferClassName(node, ancestors),
      location: node.loc,
      parameterNames: getFunctionParameterNames(node),
      identifier: node.id
    });
  }

  if (t.isJSXElement(node)) {
    symbols.hasJsx = true;
  }

  if (t.isClassDeclaration(node)) {
    symbols.classes.push({
      name: node.id.name,
      parent: node.superClass,
      location: node.loc
    });
  }

  if (t.isImportDeclaration(node)) {
    symbols.imports.push({
      source: node.source.value,
      location: node.loc,
      specifiers: getSpecifiers(node.specifiers)
    });
  }

  if (t.isObjectProperty(node)) {
    const { start, end, identifierName } = node.key.loc;
    symbols.objectProperties.push({
      name: identifierName,
      location: { start, end },
      expression: getSnippet(node, null, ancestors)
    });
  }

  if (t.isMemberExpression(node)) {
    const { start, end } = node.property.loc;
    symbols.memberExpressions.push({
      name: node.property.name,
      location: { start, end },
      expressionLocation: node.loc,
      expression: getSnippet(node, null, ancestors),
      computed: node.computed
    });
  }

  if (t.isCallExpression(node)) {
    const callee = node.callee;
    const args = node.arguments;
    if (!t.isMemberExpression(callee)) {
      const { start, end, identifierName } = callee.loc;
      symbols.callExpressions.push({
        name: identifierName,
        values: args.filter(arg => arg.value).map(arg => arg.value),
        location: { start, end }
      });
    }
  }

  if (t.isIdentifier(node) && !t.isGenericTypeAnnotation(parent)) {
    let { start, end } = node.loc;

    // We want to include function params, but exclude the function name
    if (t.isClassMethod(parent) && !node.inList) {
      return;
    }

    if (t.isProperty(parent)) {
      return;
    }

    if (node.typeAnnotation) {
      const column = node.typeAnnotation.loc.start.column;
      end = { ...end, column };
    }

    symbols.identifiers.push({
      name: node.name,
      expression: node.name,
      location: { start, end }
    });
  }

  if (t.isThisExpression(node)) {
    const { start, end } = node.loc;
    symbols.identifiers.push({
      name: "this",
      location: { start, end },
      expressionLocation: node.loc,
      expression: "this"
    });
  }

  if (t.isVariableDeclarator(node)) {
    const idNode = node.id;
    const { start, end } = idNode.loc;
    if (t.isArrayPattern(idNode)) {
      return;
    }
    symbols.identifiers.push({
      name: idNode.name,
      expression: idNode.name,
      location: { start, end }
    });
  }
}

function extractSymbols(sourceId) {
  const symbols = {
    functions: [],
    variables: [],
    callExpressions: [],
    memberExpressions: [],
    objectProperties: [],
    comments: [],
    identifiers: [],
    classes: [],
    imports: [],
    hasJsx: false
  };

  const ast = traverseAst(sourceId, {
    enter(node: NodePath, ancestors) {
      // try {
      extractSymbol(node, ancestors, symbols);
      // } catch (e) {
      //   console.error(e);
      // }
    }
  });

  // comments are extracted separately from the AST
  symbols.comments = getComments(ast);

  return symbols;
}

function extendSnippet(
  name: string,
  expression: string,
  node: NodePath,
  prevNode: NodePath
) {
  const computed = node && node.computed;
  const prevComputed = prevNode && prevNode.computed;
  const prevArray = t.isArrayExpression(prevNode);
  const array = t.isArrayExpression(node);

  if (expression === "") {
    if (computed) {
      return `[${name}]`;
    }
    return name;
  }

  if (computed || array) {
    if (prevComputed || prevArray) {
      return `[${name}]${expression}`;
    }
    return `[${name}].${expression}`;
  }

  if (prevComputed || prevArray) {
    return `${name}${expression}`;
  }

  return `${name}.${expression}`;
}

function getMemberSnippet(node: Node, expression: string = "") {
  if (t.isMemberExpression(node)) {
    const name = node.property.name;

    return getMemberSnippet(node.object, extendSnippet(name, expression));
  }

  if (t.isCallExpression(node)) {
    return "";
  }

  if (t.isThisExpression(node)) {
    return `this.${expression}`;
  }

  if (t.isIdentifier(node)) {
    return `${node.name}.${expression}`;
  }

  return expression;
}

function getObjectSnippet(
  node: NodePath,
  prevNode: NodePath,
  ancestors,
  expression: string = ""
) {
  if (!node) {
    return expression;
  }

  const name = node.key.name;
  const extendedExpression = extendSnippet(name, expression, node, prevNode);

  const nextPath = node.parentPath && node.parentPath.parentPath;
  // ancestors.slice(2)?.node

  return getSnippet(nextPath, node, ancestors, extendedExpression);
}

function getArraySnippet(
  node: NodePath,
  prevNode: NodePath,
  ancestors,
  expression: string
) {
  const index = prevNode.parentPath.key;
  const extendedExpression = extendSnippet(index, expression, node, prevNode);

  const nextNode = node.parentPath && node.parentPath.parentPath;
  // ancestors.slice(2)?.node
  // grandparent

  return getSnippet(nextNode, node, ancestors, extendedExpression);
}

function getSnippet(node, prevNode, ancestors, expression = "") {
  if (t.isVariableDeclaration(node)) {
    const node = node.declarations[0];
    const name = node.id.name;
    return extendSnippet(name, expression, node, prevNode);
  }

  if (t.isVariableDeclarator(node)) {
    const idNode = node.id;
    if (t.isObjectPattern(idNode)) {
      return expression;
    }

    const name = idNode.name;
    const prop = extendSnippet(name, expression, node, prevNode);
    return prop;
  }

  if (t.isAssignmentExpression(node)) {
    const leftNode = node.left;
    const name = t.isMemberExpression(leftNode)
      ? getMemberSnippet(leftNode)
      : leftNode.name;

    const prop = extendSnippet(name, expression, node, prevNode);
    return prop;
  }

  if (isFunction(node)) {
    return expression;
  }

  if (t.isIdentifier(node)) {
    const idNode = node;
    return `${idNode.name}.${expression}`;
  }

  if (t.isObjectProperty(node)) {
    return getObjectSnippet(node, prevNode, ancestors, expression);
  }

  if (t.isObjectExpression(node)) {
    // const parentPath = prevNode && prevNode.parentPath;

    const parentNode = getRelativeAncestor(prevNode, [], 1);
    return getObjectSnippet(parentNode, prevNode, ancestors, expression);
  }

  if (t.isMemberExpression(node)) {
    return getMemberSnippet(node, expression);
  }

  if (t.isArrayExpression(node)) {
    return getArraySnippet(node, prevNode, ancestors, expression);
  }
}

function getRelativeAncestor(node, ancestors, index) {
  const ancestorIndex = ancestors.findIndex(ancestor => ancestor.node === node);
  return ancestors[ancestorIndex - index];
}

export function clearSymbols() {
  symbolDeclarations = new Map();
}

export default function getSymbols(sourceId: string): SymbolDeclarations {
  if (symbolDeclarations.has(sourceId)) {
    const symbols = symbolDeclarations.get(sourceId);
    if (symbols) {
      return symbols;
    }
  }

  const symbols = extractSymbols(sourceId);

  symbolDeclarations.set(sourceId, symbols);
  return symbols;
}
