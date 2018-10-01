/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as t from "@babel/types";

import createSimplePath from "./utils/simple-path";
import { traverseAst } from "./utils/ast";
import {
  isVariable,
  isFunction,
  isObjectShorthand,
  isComputedExpression,
  getObjectExpressionValue,
  getVariableNames,
  getComments,
  getSpecifiers,
  getCode
} from "./utils/helpers";

import { inferClassName } from "./utils/inferClassName";
import getFunctionName from "./utils/getFunctionName";

import type { SimplePath, Node, TraversalAncestors } from "./utils/simple-path";

type AstPosition = { line: number, column: number };
type AstLocation = { end: AstPosition, start: AstPosition };

export type SymbolDeclaration = {
  name: string,
  location: AstLocation
};

export type ClassDeclaration = SymbolDeclaration & {
  parent: ?{|
    name: string,
    location: AstLocation
  |}
};

export type FunctionDeclaration = SymbolDeclaration & {
  parameterNames: string[],
  klass: string | null,
  identifier: Object
};

export type CallDeclaration = SymbolDeclaration & {
  values: string[]
};

export type MemberDeclaration = SymbolDeclaration & {
  computed: Boolean,
  expression: string
};

export type IdentifierDeclaration = {
  name: string,
  location: AstLocation,
  expression: string
};
export type ImportDeclaration = {
  source: string,
  location: AstLocation,
  specifiers: string[]
};

export type SymbolDeclarations = {|
  classes: Array<ClassDeclaration>,
  functions: Array<FunctionDeclaration>,
  variables: Array<SymbolDeclaration>,
  memberExpressions: Array<MemberDeclaration>,
  callExpressions: Array<CallDeclaration>,
  objectProperties: Array<IdentifierDeclaration>,
  identifiers: Array<IdentifierDeclaration>,
  imports: Array<ImportDeclaration>,
  comments: Array<SymbolDeclaration>,
  literals: Array<IdentifierDeclaration>,
  hasJsx: boolean,
  hasTypes: boolean,
  loading: false
|};

let symbolDeclarations: Map<string, SymbolDeclarations> = new Map();

function getFunctionParameterNames(path: SimplePath): string[] {
  if (path.node.params != null) {
    return path.node.params.map(param => {
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

/* eslint-disable complexity */
function extractSymbol(path: SimplePath, symbols) {
  if (isVariable(path)) {
    symbols.variables.push(...getVariableNames(path));
  }

  if (isFunction(path)) {
    symbols.functions.push({
      name: getFunctionName(path.node, path.parent),
      klass: inferClassName(path),
      location: path.node.loc,
      parameterNames: getFunctionParameterNames(path),
      identifier: path.node.id
    });
  }

  if (t.isJSXElement(path)) {
    symbols.hasJsx = true;
  }

  if (t.isGenericTypeAnnotation(path)) {
    symbols.hasTypes = true;
  }

  if (t.isClassDeclaration(path)) {
    const { loc, superClass } = path.node;
    symbols.classes.push({
      name: path.node.id.name,
      parent: superClass
        ? {
            name: t.isMemberExpression(superClass)
              ? getCode(superClass)
              : superClass.name,
            location: superClass.loc
          }
        : null,
      location: loc
    });
  }

  if (t.isImportDeclaration(path)) {
    symbols.imports.push({
      source: path.node.source.value,
      location: path.node.loc,
      specifiers: getSpecifiers(path.node.specifiers)
    });
  }

  if (t.isObjectProperty(path)) {
    const { start, end, identifierName } = path.node.key.loc;
    symbols.objectProperties.push({
      name: identifierName,
      location: { start, end },
      expression: getSnippet(path)
    });
  }

  if (t.isMemberExpression(path)) {
    const { start, end } = path.node.property.loc;
    symbols.memberExpressions.push({
      name: path.node.property.name,
      location: { start, end },
      expression: getSnippet(path),
      computed: path.node.computed
    });
  }

  if (
    (t.isStringLiteral(path) || t.isNumericLiteral(path)) &&
    t.isMemberExpression(path.parentPath)
  ) {
    // We only need literals that are part of computed memeber expressions
    const { start, end } = path.node.loc;
    symbols.literals.push({
      name: path.node.value,
      location: { start, end },
      expression: getSnippet(path.parentPath)
    });
  }

  if (t.isCallExpression(path)) {
    const callee = path.node.callee;
    const args = path.node.arguments;
    if (!t.isMemberExpression(callee)) {
      const { start, end, identifierName } = callee.loc;
      symbols.callExpressions.push({
        name: identifierName,
        values: args.filter(arg => arg.value).map(arg => arg.value),
        location: { start, end }
      });
    }
  }

  if (t.isStringLiteral(path) && t.isProperty(path.parentPath)) {
    const { start, end } = path.node.loc;
    return symbols.identifiers.push({
      name: path.node.value,
      expression: getObjectExpressionValue(path.parent),
      location: { start, end }
    });
  }

  if (t.isIdentifier(path) && !t.isGenericTypeAnnotation(path.parent)) {
    let { start, end } = path.node.loc;

    // We want to include function params, but exclude the function name
    if (t.isClassMethod(path.parent) && !path.inList) {
      return;
    }

    if (t.isProperty(path.parentPath) && !isObjectShorthand(path.parent)) {
      return symbols.identifiers.push({
        name: path.node.name,
        expression: getObjectExpressionValue(path.parent),
        location: { start, end }
      });
    }

    if (path.node.typeAnnotation) {
      const column = path.node.typeAnnotation.loc.start.column;
      end = { ...end, column };
    }

    symbols.identifiers.push({
      name: path.node.name,
      expression: path.node.name,
      location: { start, end }
    });
  }

  if (t.isThisExpression(path.node)) {
    const { start, end } = path.node.loc;
    symbols.identifiers.push({
      name: "this",
      location: { start, end },
      expression: "this"
    });
  }

  if (t.isVariableDeclarator(path)) {
    const nodeId = path.node.id;

    if (t.isArrayPattern(nodeId)) {
      return;
    }

    const properties =
      nodeId.properties && t.objectPattern(nodeId.properties)
        ? nodeId.properties
        : [
            {
              value: { name: nodeId.name },
              loc: path.node.loc
            }
          ];

    properties.forEach(function(property) {
      const { start, end } = property.loc;
      symbols.identifiers.push({
        name: property.value.name,
        expression: property.value.name,
        location: { start, end }
      });
    });
  }
}
/* eslint-enable complexity */

function extractSymbols(sourceId): SymbolDeclarations {
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
    literals: [],
    hasJsx: false,
    hasTypes: false,
    loading: false
  };

  const ast = traverseAst(sourceId, {
    enter(node: Node, ancestors: TraversalAncestors) {
      try {
        const path = createSimplePath(ancestors);
        if (path) {
          extractSymbol(path, symbols);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // comments are extracted separately from the AST
  symbols.comments = getComments(ast);

  return symbols;
}

function extendSnippet(
  name: string,
  expression: string,
  path?: { node: Node },
  prevPath?: SimplePath
) {
  const computed = path && path.node.computed;
  const prevComputed = prevPath && prevPath.node.computed;
  const prevArray = t.isArrayExpression(prevPath);
  const array = t.isArrayExpression(path);
  const value =
    (path &&
      path.node.property &&
      path.node.property.extra &&
      path.node.property.extra.raw) ||
    "";

  if (expression === "") {
    if (computed) {
      return name === undefined ? `[${value}]` : `[${name}]`;
    }
    return name;
  }

  if (computed || array) {
    if (prevComputed || prevArray) {
      return `[${name}]${expression}`;
    }
    return `[${name === undefined ? value : name}].${expression}`;
  }

  if (prevComputed || prevArray) {
    return `${name}${expression}`;
  }

  if (isComputedExpression(expression) && name !== undefined) {
    return `${name}${expression}`;
  }

  return `${name}.${expression}`;
}

function getMemberSnippet(node: Node, expression: string = "") {
  if (t.isMemberExpression(node)) {
    const name = node.property.name;
    const snippet = getMemberSnippet(
      node.object,
      extendSnippet(name, expression, { node })
    );
    return snippet;
  }

  if (t.isCallExpression(node)) {
    return "";
  }

  if (t.isThisExpression(node)) {
    return `this.${expression}`;
  }

  if (t.isIdentifier(node)) {
    if (isComputedExpression(expression)) {
      return `${node.name}${expression}`;
    }
    return `${node.name}.${expression}`;
  }

  return expression;
}

function getObjectSnippet(
  path: ?SimplePath,
  prevPath?: SimplePath,
  expression?: string = ""
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
  path: SimplePath,
  prevPath: SimplePath,
  expression: string
) {
  if (!prevPath.parentPath) {
    throw new Error("Assertion failure - path should exist");
  }

  const index = `${prevPath.parentPath.containerIndex}`;
  const extendedExpression = extendSnippet(index, expression, path, prevPath);

  const nextPrevPath = path;
  const nextPath = path.parentPath && path.parentPath.parentPath;

  return getSnippet(nextPath, nextPrevPath, extendedExpression);
}

function getSnippet(
  path: SimplePath | null,
  prevPath?: SimplePath,
  expression?: string = ""
): string {
  if (!path) {
    return expression;
  }

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
    if (!prevPath) {
      throw new Error("Assertion failure - path should exist");
    }

    return getArraySnippet(path, prevPath, expression);
  }

  return "";
}

export function clearSymbols() {
  symbolDeclarations = new Map();
}

export function getSymbols(sourceId: string): SymbolDeclarations {
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
