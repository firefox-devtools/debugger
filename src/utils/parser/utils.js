// @flow

const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const t = require("babel-types");
const { isDevelopment } = require("devtools-config");
const toPairs = require("lodash/toPairs");
const get = require("lodash/get");
const isEmpty = require("lodash/isEmpty");

import type { SourceText, Location, Expression } from "../../types";

const ASTs = new Map();

const symbolDeclarations = new Map();

type ASTLocation = {
  start: {
    line: number,
    column: number,
  },
  end: {
    line: number,
    column: number,
  },
};

export type SymbolDeclaration = {
  name: string,
  location: ASTLocation,
};

export type FormattedSymbolDeclaration = {
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: ASTLocation,
};

export type SymbolDeclarations = {
  functions: Array<FormattedSymbolDeclaration>,
  variables: Array<FormattedSymbolDeclaration>,
  classes: Array<FormattedSymbolDeclaration>,
};

function _parse(code) {
  return babylon.parse(code, {
    sourceType: "module",

    plugins: ["jsx", "flow"],
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

  const ast = parse(sourceText.text);
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

  if (parent.right && isFunction(parent.right)) {
    return parent.left.property.name;
  }

  return "anonymous";
}

function isFunction(path) {
  return t.isFunction(path) ||
    t.isArrowFunctionExpression(path) ||
    t.isObjectMethod(path) ||
    t.isClassMethod(path) ||
    t.isFunctionExpression(path);
}

function formatSymbol(symbol: SymbolDeclaration): FormattedSymbolDeclaration {
  return {
    id: `${symbol.name}:${symbol.location.start.line}`,
    title: symbol.name,
    subtitle: `:${symbol.location.start.line}`,
    value: symbol.name,
    location: symbol.location,
  };
}

function getVariableNames(path) {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
    return [
      formatSymbol({
        name: path.node.key.name,
        location: path.node.loc,
      }),
    ];
  }

  if (!path.node.declarations) {
    return path.node.params.map(dec =>
      formatSymbol({
        name: dec.name,
        location: dec.loc,
      }));
  }

  return path.node.declarations.map(dec =>
    formatSymbol({
      name: dec.id.name,
      location: dec.loc,
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

function getSymbols(source: SourceText): SymbolDeclarations {
  if (symbolDeclarations.has(source.id)) {
    const symbols = symbolDeclarations.get(source.id);
    if (symbols) {
      return symbols;
    }
  }

  const ast = getAst(source);
  const symbols = { functions: [], variables: [], classes: [] };

  traverse(ast, {
    enter(path) {
      if (isVariable(path)) {
        symbols.variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        symbols.functions.push(
          formatSymbol({
            name: getFunctionName(path),
            location: path.node.loc,
          }),
        );
      }

      if (t.isClassDeclaration(path)) {
        symbols.classes.push(
          formatSymbol({
            name: path.node.id.name,
            location: path.node.loc,
          }),
        );
      }
    },
  });

  symbolDeclarations.set(source.id, symbols);
  return symbols;
}

function getExpression(
  source: SourceText,
  token: string,
  location: Location,
): ?Expression {
  let expression = null;
  const ast = getAst(source);

  if (isEmpty(ast)) {
    return;
  }

  traverse(ast, {
    enter(path) {
      const node = path.node;
      if (
        t.isMemberExpression(node) &&
        node.property.name === token &&
        nodeContainsLocation({ node, location })
      ) {
        const expr = getMemberExpression(node);
        expression = {
          value: expr.join("."),
          location: node.loc,
        };
      }
    },
  });

  return expression;
}

function nodeContainsLocation({ node, location }) {
  const { start, end } = node.loc;
  const { line, column } = location;

  return !(start.line > line ||
    (start.line === line && start.column > column) ||
    end.line < line ||
    (end.line === line && end.column < column));
}

function getPathClosestToLocation(source: SourceText, location: Location) {
  const ast = getAst(source);
  let pathClosestToLocation = null;

  traverse(ast, {
    enter(path) {
      if (nodeContainsLocation({ node: path.node, location })) {
        pathClosestToLocation = path;
      }
    },
  });

  return pathClosestToLocation;
}

function getVariablesInScope(source: SourceText, location: Location) {
  const path = getPathClosestToLocation(source, location);
  const bindings = get(path, "scope.bindings", {});

  return toPairs(bindings).map(([name, binding]) => ({
    name,
    references: binding.referencePaths,
  }));
}

module.exports = {
  getSymbols,
  getPathClosestToLocation,
  getVariablesInScope,
  getExpression,
};
