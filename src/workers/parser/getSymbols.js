/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import { isVariable, isFunction } from "./utils/helpers";
import { inferClassName } from "./utils/inferClassName";
import * as t from "babel-types";
import getFunctionName from "./utils/getFunctionName";

import type { Source } from "debugger-html";
import type { NodePath, Node, Location as BabelLocation } from "babel-traverse";
let symbolDeclarations = new Map();

export type SymbolDeclaration = {|
  name: string,
  expression?: string,
  klass?: ?string,
  location: BabelLocation,
  expressionLocation?: BabelLocation,
  parameterNames?: string[],
  identifier?: Object,
  computed?: Boolean
|};

export type FunctionDeclaration = SymbolDeclaration & {|
  parameterNames: string[]
|};

export type SymbolDeclarations = {
  functions: Array<SymbolDeclaration>,
  variables: Array<SymbolDeclaration>,
  memberExpressions: Array<SymbolDeclaration>,
  callExpressions: Array<SymbolDeclaration>,
  objectProperties: Array<SymbolDeclaration>,
  identifiers: Array<SymbolDeclaration>,
  comments: Array<SymbolDeclaration>
};

function getFunctionParameterNames(path: NodePath): string[] {
  if (path.node.params != null) {
    return path.node.params.map(param => param.name);
  }
  return [];
}

function getVariableNames(path: NodePath): SymbolDeclaration[] {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
    if (path.node.key.type === "StringLiteral") {
      return [
        {
          name: path.node.key.value,
          location: path.node.loc
        }
      ];
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

  return path.node.declarations.map(dec => ({
    name: dec.id.name,
    location: dec.loc
  }));
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

function extractSymbols(source: Source) {
  const functions = [];
  const variables = [];
  const memberExpressions = [];
  const callExpressions = [];
  const objectProperties = [];
  const identifiers = [];
  const classes = [];
  const imports = [];

  const ast = traverseAst(source, {
    enter(path: NodePath) {
      if (isVariable(path)) {
        variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        functions.push({
          name: getFunctionName(path),
          klass: inferClassName(path),
          location: path.node.loc,
          parameterNames: getFunctionParameterNames(path),
          identifier: path.node.id
        });
      }

      if (t.isClassDeclaration(path)) {
        classes.push({
          name: path.node.id.name,
          parent: path.node.superClass,
          location: path.node.loc
        });
      }

      if (t.isImportDeclaration(path)) {
        imports.push({
          source: path.node.source.value,
          location: path.node.loc,
          specifiers: getSpecifiers(path.node.specifiers)
        });
      }

      if (t.isObjectProperty(path)) {
        const { start, end, identifierName } = path.node.key.loc;
        objectProperties.push({
          name: identifierName,
          location: { start, end },
          expression: getSnippet(path)
        });
      }

      if (t.isMemberExpression(path)) {
        const { start, end } = path.node.property.loc;
        memberExpressions.push({
          name: path.node.property.name,
          location: { start, end },
          expressionLocation: path.node.loc,
          expression: getSnippet(path),
          computed: path.node.computed
        });
      }

      if (t.isCallExpression(path)) {
        const callee = path.node.callee;
        if (!t.isMemberExpression(callee)) {
          const { start, end, identifierName } = callee.loc;
          callExpressions.push({
            name: identifierName,
            location: { start, end }
          });
        }
      }

      if (t.isIdentifier(path)) {
        let { start, end } = path.node.loc;

        if (path.node.typeAnnotation) {
          const column = path.node.typeAnnotation.loc.start.column;
          end = { ...end, column };
        }

        identifiers.push({
          name: path.node.name,
          expression: path.node.name,
          location: { start, end }
        });
      }

      if (t.isThisExpression(path.node)) {
        const { start, end } = path.node.loc;
        identifiers.push({
          name: "this",
          location: { start, end },
          expressionLocation: path.node.loc,
          expression: "this"
        });
      }

      if (t.isVariableDeclarator(path)) {
        const node = path.node.id;
        const { start, end } = path.node.loc;

        identifiers.push({
          name: node.name,
          expression: node.name,
          location: { start, end }
        });
      }
    }
  });

  // comments are extracted separately from the AST
  const comments = getComments(ast);

  return {
    functions,
    variables,
    callExpressions,
    memberExpressions,
    objectProperties,
    comments,
    identifiers,
    classes,
    imports
  };
}

export default function getSymbols(source: Source): SymbolDeclarations {
  if (symbolDeclarations.has(source.id)) {
    const symbols = symbolDeclarations.get(source.id);
    if (symbols) {
      return symbols;
    }
  }

  const symbols = extractSymbols(source);
  symbolDeclarations.set(source.id, symbols);
  return symbols;
}

function extendSnippet(
  name: string,
  expression: string,
  path: NodePath,
  prevPath: NodePath
) {
  const computed = path && path.node.computed;
  const prevComputed = prevPath && prevPath.node.computed;
  const prevArray = t.isArrayExpression(prevPath);
  const array = t.isArrayExpression(path);

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
  path: NodePath,
  prevPath: NodePath,
  expression: string = ""
) {
  if (!path) {
    return expression;
  }

  const name = path.node.key.name;

  const extendedExpression = extendSnippet(name, expression, path, prevPath);

  const nextPrevPath = path;
  const nextPath = path.parentPath && path.parentPath.parentPath;

  return getSnippet(nextPath, nextPrevPath, extendedExpression);
}

function getArraySnippet(
  path: NodePath,
  prevPath: NodePath,
  expression: string
) {
  const index = prevPath.parentPath.key;
  const extendedExpression = extendSnippet(index, expression, path, prevPath);

  const nextPrevPath = path;
  const nextPath = path.parentPath && path.parentPath.parentPath;

  return getSnippet(nextPath, nextPrevPath, extendedExpression);
}

function getSnippet(path, prevPath, expression = "") {
  if (t.isVariableDeclaration(path)) {
    const node = path.node.declarations[0];
    const name = node.id.name;
    return extendSnippet(name, expression, path, prevPath);
  }

  if (t.isVariableDeclarator(path)) {
    const node = path.node.id;
    if (t.isObjectPattern(node)) {
      return expression;
    }

    const name = node.name;
    const prop = extendSnippet(name, expression, path, prevPath);
    return prop;
  }

  if (t.isAssignmentExpression(path)) {
    const node = path.node.left;
    const name = t.isMemberExpression(node)
      ? getMemberSnippet(node)
      : node.name;

    const prop = extendSnippet(name, expression, path, prevPath);
    return prop;
  }

  if (isFunction(path)) {
    return expression;
  }

  if (t.isIdentifier(path)) {
    const node = path.node;
    return `${node.name}.${expression}`;
  }

  if (t.isObjectProperty(path)) {
    return getObjectSnippet(path, prevPath, expression);
  }

  if (t.isObjectExpression(path)) {
    const parentPath = prevPath && prevPath.parentPath;
    return getObjectSnippet(parentPath, prevPath, expression);
  }

  if (t.isMemberExpression(path)) {
    return getMemberSnippet(path.node, expression);
  }

  if (t.isArrayExpression(path)) {
    return getArraySnippet(path, prevPath, expression);
  }
}

export function clearSymbols() {
  symbolDeclarations = new Map();
}
