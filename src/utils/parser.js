// @flow

const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const t = require("babel-types");
const { isDevelopment } = require("devtools-config");
const { entries } = require("./utils");
const get = require("lodash/get");

import type { SourceText, Source, Location } from "../types";

const ASTs = new Map();

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
  if (ASTs.has(sourceText.id)) {
    return ASTs.get(sourceText.id);
  }

  let ast;
  try {
    ast = _parse(sourceText.text);
  } catch (error) {
    if (isDevelopment()) {
      console.warn("parse failed", sourceText);
    }

    ast = {};
  }

  ASTs.set(sourceText.id, ast);
  return ast;
}

function getAst(source) {
  return ASTs.get(source.id);
}

function getFunctionName(path) {
  if (path.node.id) {
    return path.node.id.name;
  }

  const parent = path.parent;
  if (parent.type == "ObjectProperty") {
    return parent.key.name;
  }

  if (parent.type == "VariableDeclarator") {
    return parent.id.name;
  }
}

function getFunctions(source: Source) {
  const ast = getAst(source);

  const functions = [];

  traverse(ast, {
    enter(path) {
      if (t.isFunction(path)) {
        functions.push({
          name: getFunctionName(path),
          location: path.node.loc
        });
      }
    }
  });

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

function getPathClosestToLocation(source: Source, location: Location) {
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

function getVariablesInScope(source: Source, location: Location) {
  const path = getPathClosestToLocation(source, location);
  const bindings = get(path, "scope.bindings", {});

  return entries(bindings)
    .map(([name, binding]) => ({
      name,
      references: binding.referencePaths
    })
  );
}

module.exports = {
  parse,
  getFunctions,
  getPathClosestToLocation,
  getVariablesInScope
};
