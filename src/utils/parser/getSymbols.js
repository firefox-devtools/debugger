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
          expression: getObjectExpression(path)
        });
      }

      if (t.isMemberExpression(path)) {
        const { start, end } = path.node.property.loc;
        symbols.memberExpressions.push({
          name: path.node.property.name,
          location: { start, end },
          expressionLocation: path.node.loc,
          expression: getExpression(path.node)
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
    }
  });

  symbolDeclarations.set(source.id, symbols);
  return symbols;
}

function getExpression(root) {
  function _getMemberExpression(node, expr) {
    if (t.isMemberExpression(node)) {
      return _getMemberExpression(node.object, [node.property.name, ...expr]);
    }

    if (t.isCallExpression(node)) {
      return [];
    }

    if (t.isThisExpression(node)) {
      return ["this", ...expr];
    }

    if (t.isIdentifier(node)) {
      return [node.name, ...expr];
    }

    return expr;
  }

  const expr = _getMemberExpression(root, []);
  return expr.join(".");
}

function getObjectExpression(path) {
  let expr = "";
  let prevPath = undefined;
  do {
    const name = path.node.key.name;

    if (path.node.computed) {
      expr = `[${name}]${expr}`;
    } else {
      expr = expr === "" ? name : `${name}.${expr}`;
    }

    prevPath = path;
    path = path.parentPath && path.parentPath.parentPath;
  } while (t.isObjectProperty(path));

  if (t.isVariableDeclarator(path)) {
    const node = path.node.id;
    if (t.isObjectPattern(node)) {
      return expr;
    }

    const name = node.name;
    return prevPath.node.computed ? `${name}${expr}` : `${name}.${expr}`;
  }

  if (t.isAssignmentExpression(path)) {
    const node = path.node.left;
    const name = t.isMemberExpression(node) ? getExpression(node) : node.name;
    return prevPath.node.computed ? `${name}${expr}` : `${name}.${expr}`;
  }

  if (isFunction(path)) {
    return expr;
  }
}
