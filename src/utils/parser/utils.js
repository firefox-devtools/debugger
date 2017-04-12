// @flow

const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const t = require("babel-types");
const { isDevelopment } = require("devtools-config");
const toPairs = require("lodash/toPairs");
const get = require("lodash/get");
const isEmpty = require("lodash/isEmpty");

import type { SourceText, Location, Frame, TokenResolution } from "../../types";

const ASTs = new Map();

const symbolDeclarations = new Map();

type ASTLocation = {
  start: {
    line: number,
    column: number
  },
  end: {
    line: number,
    column: number
  }
};

export type SymbolDeclaration = {
  name: string,
  location: ASTLocation
};

export type FormattedSymbolDeclaration = {
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: ASTLocation
};

export type SymbolDeclarations = {
  functions: Array<FormattedSymbolDeclaration>,
  variables: Array<FormattedSymbolDeclaration>
};

function _parse(code) {
  return babylon.parse(code, {
    sourceType: "module",

    plugins: ["jsx", "flow"]
  });
}

function parse(text: string) {
  let ast;
  if (!text) {
    return;
  }

  try {
    ast = _parse(text);
  } catch (error) {
    if (isDevelopment()) {
      console.warn("parse failed", text);
    }

    ast = {};
  }

  return ast;
}

function getAst(sourceText: SourceText) {
  if (ASTs.has(sourceText.id)) {
    return ASTs.get(sourceText.id);
  }

  let ast = {};
  if (sourceText.contentType == "text/javascript") {
    ast = parse(sourceText.text);
  }

  ASTs.set(sourceText.id, ast);
  return ast;
}

function getFunctionName(path) {
  if (path.node.id) {
    return path.node.id.name;
  }

  const parent = path.parent;
  if (parent.type == "ObjectProperty") {
    return parent.key.name;
  }

  if (parent.type == "ObjectExpression" || path.node.type == "ClassMethod") {
    return path.node.key.name;
  }

  if (parent.type == "VariableDeclarator") {
    return parent.id.name;
  }

  if (parent.type == "AssignmentExpression") {
    if (parent.left.type == "MemberExpression") {
      return parent.left.property.name;
    }

    return parent.left.name;
  }

  return "anonymous";
}

function isFunction(path) {
  return t.isFunction(path) ||
    t.isArrowFunctionExpression(path) ||
    t.isObjectMethod(path) ||
    t.isClassMethod(path);
}

function formatSymbol(symbol: SymbolDeclaration): FormattedSymbolDeclaration {
  return {
    id: `${symbol.name}:${symbol.location.start.line}`,
    title: symbol.name,
    subtitle: `:${symbol.location.start.line}`,
    value: symbol.name,
    location: symbol.location
  };
}

function getVariableNames(path) {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
    return [
      formatSymbol({
        name: path.node.key.name,
        location: path.node.loc
      })
    ];
  }

  if (!path.node.declarations) {
    return path.node.params.map(dec =>
      formatSymbol({
        name: dec.name,
        location: dec.loc
      }));
  }

  return path.node.declarations.map(dec =>
    formatSymbol({
      name: dec.id.name,
      location: dec.loc
    }));
}

function isVariable(path) {
  return t.isVariableDeclaration(path) ||
    (isFunction(path) && path.node.params.length) ||
    (t.isObjectProperty(path) && !isFunction(path.node.value));
}

function getMemberExpression(root) {
  function _getMemberExpression(node, expr) {
    if (t.isMemberExpression(node)) {
      expr = [node.property.name].concat(expr);
      return _getMemberExpression(node.object, expr);
    }

    if (t.isThisExpression(node)) {
      return ["this"].concat(expr);
    }
    return [node.name].concat(expr);
  }

  return _getMemberExpression(root, []);
}

export function getSymbols(source: SourceText): SymbolDeclarations {
  if (symbolDeclarations.has(source.id)) {
    const symbols = symbolDeclarations.get(source.id);
    if (symbols) {
      return symbols;
    }
  }

  const ast = getAst(source);

  const symbols = { functions: [], variables: [] };

  if (!ast || isEmpty(ast)) {
    return symbols;
  }

  traverse(ast, {
    enter(path) {
      if (isVariable(path)) {
        symbols.variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        symbols.functions.push(
          formatSymbol({
            name: getFunctionName(path),
            location: path.node.loc
          })
        );
      }

      if (t.isClassDeclaration(path)) {
        symbols.variables.push(
          formatSymbol({
            name: path.node.id.name,
            location: path.node.loc
          })
        );
      }
    }
  });

  symbolDeclarations.set(source.id, symbols);
  return symbols;
}

function resolveExpression(path, token: string, location: Location): ?Object {
  const node = path.node;
  if (
    t.isMemberExpression(node) &&
    node.property.name === token &&
    nodeContainsLocation({ node, location })
  ) {
    const expr = getMemberExpression(node);
    return {
      value: expr.join("."),
      location: node.loc
    };
  }

  return null;
}

function resolveScope(path, location: Location) {
  const node = path.node;
  if (
    (isFunction(path) || t.isProgram(path)) &&
    nodeContainsLocation({ node, location })
  ) {
    return path;
  }
}

// Resolves a token (at location) in the source to determine if it is in scope
// of the given frame and the expression (if any) to which it belongs
export function resolveToken(
  source: SourceText,
  token: string,
  location: Location,
  frame: Frame
): ?TokenResolution {
  const ast = getAst(source);
  const scopes = [];
  let expression = null;
  let inScope = false;

  if (isEmpty(ast)) {
    return { expression: null, inScope: false };
  }

  traverse(ast, {
    enter(path) {
      let scope = null;

      // if we haven't found an expression yet, determine if the token is part
      // of one
      if (!expression) {
        expression = resolveExpression(path, token, location);
      }

      // determine if the current path is a function or program containing the
      // frame
      scope = resolveScope(path, frame.location);
      if (scope) {
        scopes.unshift(scope);
      }
    }
  });

  // determine if the narrowest scope contains the token's location
  inScope = nodeContainsLocation({ node: scopes[0].node, location });

  return {
    expression,
    inScope
  };
}

function nodeContainsLocation({ node, location }) {
  const { start, end } = node.loc;
  const { line, column } = location;

  return !(start.line > line ||
    (start.line === line && start.column > column) ||
    end.line < line ||
    (end.line === line && end.column < column));
}

export function getPathClosestToLocation(
  source: SourceText,
  location: Location
) {
  const ast = getAst(source);
  let pathClosestToLocation = null;

  traverse(ast, {
    enter(path) {
      if (nodeContainsLocation({ node: path.node, location })) {
        pathClosestToLocation = path;
      }
    }
  });

  return pathClosestToLocation;
}

export function getVariablesInScope(source: SourceText, location: Location) {
  const path = getPathClosestToLocation(source, location);
  const bindings = get(path, "scope.bindings", {});

  return toPairs(bindings).map(([name, binding]) => ({
    name,
    references: binding.referencePaths
  }));
}
