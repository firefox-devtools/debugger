// @flow

import { traverseAst } from "./utils/ast";
import { isVariable, isFunction } from "./utils/helpers";
import * as t from "babel-types";

import getFunctionName from "./utils/getFunctionName";

import type { SourceText } from "debugger-html";
import type { NodePath, Location as BabelLocation } from "babel-traverse";
const symbolDeclarations = new Map();

export type SymbolDeclaration = {|
  name: string,
  location: BabelLocation,
  parameterNames?: string[],
  identifier?: Object
|};

export type FunctionDeclaration = SymbolDeclaration & {|
  parameterNames: string[]
|};

export type SymbolDeclarations = {
  functions: Array<SymbolDeclaration>,
  variables: Array<SymbolDeclaration>
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

export default function getSymbols(source: SourceText): SymbolDeclarations {
  if (symbolDeclarations.has(source.id)) {
    const symbols = symbolDeclarations.get(source.id);
    if (symbols) {
      return symbols;
    }
  }

  let symbols = {
    functions: [],
    variables: [],
    memberExpressions: [],
    objectProperties: [],
    identifiers: []
  };

  traverseAst(source, {
    enter(path: NodePath) {
      if (isVariable(path)) {
        symbols.variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        symbols.functions.push({
          name: getFunctionName(path),
          location: path.node.loc,
          parameterNames: getFunctionParameterNames(path),
          identifier: path.node.id
        });
      }

      if (t.isClassDeclaration(path)) {
        symbols.variables.push({
          name: path.node.id.name,
          location: path.node.loc
        });
      }

      if (t.isObjectProperty(path)) {
        const { start, end, identifierName } = path.node.key.loc;
        symbols.objectProperties.push({
          name: identifierName,
          location: { start, end },
          expression: getExpression(path)
        });
      }

      if (t.isMemberExpression(path)) {
        const { start, end } = path.node.property.loc;
        symbols.memberExpressions.push({
          name: path.node.property.name,
          location: { start, end },
          expressionLocation: path.node.loc,
          expression: getExpression(path)
        });
      }

      if (t.isIdentifier(path)) {
        const { start, end } = path.node.loc;

        symbols.identifiers.push({
          name: path.node.name,
          expression: path.node.name,
          location: { start, end }
        });
      }

      if (t.isVariableDeclarator(path)) {
        const node = path.node.id;
        const { start, end } = path.node.loc;

        symbols.identifiers.push({
          name: node.name,
          expression: node.name,
          location: { start, end }
        });
      }
    }
  });

  symbolDeclarations.set(source.id, symbols);
  return symbols;
}

function addProperty(name, expression, path, prevPath) {
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

function getMemberExpression(node, expression = "") {
  if (t.isMemberExpression(node)) {
    const name = node.property.name;

    return getMemberExpression(node.object, addProperty(name, expression));
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

function getObjectExpression(path, prevPath, expression = "") {
  const name = path.node.key.name;

  expression = addProperty(name, expression, path, prevPath);

  prevPath = path;
  path = path.parentPath && path.parentPath.parentPath;

  return getExpression(path, prevPath, expression);
}

function getArrayExpression(path, prevPath, expression) {
  const index = prevPath.parentPath.key;
  expression = addProperty(index, expression, path, prevPath);

  prevPath = path;
  path = path.parentPath && path.parentPath.parentPath;

  return getExpression(path, prevPath, expression);
}

function getExpression(path, prevPath, expression = "") {
  if (t.isVariableDeclaration(path)) {
    const node = path.node.declarations[0];
    const name = node.id.name;
    return addProperty(name, expression, path, prevPath);
  }

  if (t.isVariableDeclarator(path)) {
    const node = path.node.id;
    if (t.isObjectPattern(node)) {
      return expression;
    }

    const name = node.name;
    const prop = addProperty(name, expression, path, prevPath);
    return prop;
  }

  if (t.isAssignmentExpression(path)) {
    const node = path.node.left;
    const name = t.isMemberExpression(node)
      ? getMemberExpression(node)
      : node.name;

    const prop = addProperty(name, expression, path, prevPath);
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
    return getObjectExpression(path, prevPath, expression);
  }

  if (t.isObjectExpression(path)) {
    return getObjectExpression(prevPath.parentPath, prevPath, expression);
  }

  if (t.isMemberExpression(path)) {
    return getMemberExpression(path.node, expression);
  }

  if (t.isArrayExpression(path)) {
    return getArrayExpression(path, prevPath, expression);
  }
}

export function printSymbols(source) {
  const {
    objectProperties,
    memberExpressions,
    identifiers,
    variables
  } = getSymbols(source);

  function summarize(symbol) {
    const start = symbol.location.start;
    return `(${start.line}, ${start.column}) ${symbol.expression}`;
  }

  console.log(
    [
      "properties",
      objectProperties.map(summarize).join("\n"),

      "member expressions",
      memberExpressions.map(summarize).join("\n"),

      "identifiers",
      identifiers.map(summarize).join("\n"),

      "variables",
      variables.map(p => p.name).join("\n")
    ].join("\n")
  );
}
