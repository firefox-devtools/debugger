// @flow

const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const t = require("babel-types");
const { isDevelopment } = require("devtools-config");
const toPairs = require("lodash/toPairs");
const get = require("lodash/get");

import type { SourceText, Location } from "../types";

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

const ASTs = new Map();

const functionDeclarations = new Map();

function _parse(code) {
  return babylon.parse(code, {
    sourceType: "module",

    plugins: [
      "jsx",
      "flow"
    ]
  });
}

function parse(sourceText: SourceText) {
  let ast;
  try {
    ast = _parse(sourceText.text);
  } catch (error) {
    if (isDevelopment()) {
      console.warn("parse failed", sourceText);
    }

    ast = {};
  }

  return ast;
}

function getAst(sourceText: SourceText) {
  if (ASTs.has(sourceText.id)) {
    return ASTs.get(sourceText.id);
  }

  const ast = parse(sourceText);
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

  return "anonymous";
}

function isFunction(path) {
  return t.isFunction(path) || t.isArrowFunctionExpression(path) ||
    t.isObjectMethod(path) || t.isClassMethod(path);
}

function getFunctions(source: SourceText): Array<SymbolDeclaration> {
  const ast = getAst(source);

  const functions = [];

  traverse(ast, {
    enter(path) {
      if (isFunction(path)) {
        functions.push({
          name: getFunctionName(path),
          location: path.node.loc
        });
      }
    }
  });

  return functions;
}

function getVariableNames(path) {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
    return [{
      name: path.node.key.name,
      location: path.node.loc
    }];
  }

  if (!path.node.declarations) {
    return path.node.params
    .map(dec => ({
      name: dec.name,
      location: dec.loc
    }));
  }

  return path.node.declarations
    .map(dec => ({
      name: dec.id.name,
      location: dec.loc
    }));
}

function isVariable(path) {
  return t.isVariableDeclaration(path) ||
    (isFunction(path) && path.node.params.length) ||
    (t.isObjectProperty(path) && !isFunction(path.node.value));
}

function getVariables(source: SourceText): Array<SymbolDeclaration> {
  const ast = getAst(source);

  const variables = [];

  traverse(ast, {
    enter(path) {
      if (isVariable(path)) {
        variables.push(...getVariableNames(path));
      }
    }
  });

  return variables;
}

function getFunctionDeclarations(sourceText: SourceText) {
  if (functionDeclarations.has(sourceText.id)) {
    return functionDeclarations.get(sourceText.id);
  }

  const functions = getFunctions(sourceText).map(dec => ({
    id: `${dec.name}:${dec.location.start.line}`,
    title: dec.name,
    subtitle: `:${dec.location.start.line}`,
    value: dec.name,
    location: dec.location
  }));

  functionDeclarations.set(sourceText.id, functions);
  return functions;
}

function nodeContainsLocation({ node, location }) {
  const { start, end } = node.loc;
  const { line, column } = location;

  return !(
        (start.line > line)
     || (start.line === line && start.column > column)
     || (end.line < line)
     || (end.line === line && end.column < column)
   );
}

function getPathClosestToLocation(source: SourceText, location: Location) {
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

function getVariablesInScope(source: SourceText, location: Location) {
  const path = getPathClosestToLocation(source, location);
  const bindings = get(path, "scope.bindings", {});

  return toPairs(bindings)
    .map(([name, binding]) => ({
      name,
      references: binding.referencePaths
    })
  );
}

module.exports = {
  parse,
  getFunctions,
  getVariables,
  getFunctionDeclarations,
  getPathClosestToLocation,
  getVariablesInScope
};
