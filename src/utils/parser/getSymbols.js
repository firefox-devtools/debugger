// @flow

import { traverseAst } from "./utils/ast";
import { isVariable, isFunction } from "./utils/helpers";
import * as t from "babel-types";

import getFunctionName from "./utils/getFunctionName";

import type { Source } from "debugger-html";
import type { NodePath, Node, Location as BabelLocation } from "babel-traverse";
let symbolDeclarations = new Map();

export type SymbolDeclaration = {|
  name: string,
  expression?: string,
  location: BabelLocation,
  expressionLocation?: BabelLocation,
  parameterNames?: string[],
  identifier?: Object
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
  return path.node.params.map(param => param.name);
}

function getVariableNames(path: NodePath): SymbolDeclaration[] {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
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

function extractSymbols(source: Source) {
  const functions = [];
  const variables = [];
  const memberExpressions = [];
  const callExpressions = [];
  const objectProperties = [];
  const identifiers = [];

  const ast = traverseAst(source, {
    enter(path: NodePath) {
      if (isVariable(path)) {
        variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        functions.push({
          name: getFunctionName(path),
          location: path.node.loc,
          parameterNames: getFunctionParameterNames(path),
          identifier: path.node.id
        });
      }

      if (t.isClassDeclaration(path)) {
        variables.push({
          name: path.node.id.name,
          location: path.node.loc
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
          expression: getSnippet(path)
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
        const { start, end } = path.node.loc;

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
    identifiers
  };
}

export default function getSymbols(source: Source, update): SymbolDeclarations {
  if (symbolDeclarations.has(source.id) && !update) {
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

export function formatSymbols(source: Source) {
  const {
    objectProperties,
    memberExpressions,
    callExpressions,
    identifiers,
    variables
  } = getSymbols(source);

  function formatLocation(loc) {
    if (!loc) {
      return "";
    }
    const { start, end } = loc;

    const startLoc = `(${start.line}, ${start.column})`;
    const endLoc = `(${end.line}, ${end.column})`;
    return `[${startLoc}, ${endLoc}]`;
  }

  function summarize(symbol) {
    const loc = formatLocation(symbol.location);
    const exprLoc = formatLocation(symbol.expressionLocation);
    const params = symbol.parameterNames
      ? symbol.parameterNames.join(", ")
      : "";
    const expression = symbol.expression || "";
    return `${loc} ${exprLoc} ${expression} ${symbol.name} ${params}`;
  }

  return [
    "properties",
    objectProperties.map(summarize).join("\n"),

    "member expressions",
    memberExpressions.map(summarize).join("\n"),

    "call expressions",
    callExpressions.map(summarize).join("\n"),

    "identifiers",
    identifiers.map(summarize).join("\n"),

    "variables",
    variables.map(summarize).join("\n")
  ].join("\n");
}

export function clearSymbols() {
  symbolDeclarations = new Map();
}
