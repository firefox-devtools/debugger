const babylon = require("babylon");
const traverse = require("babel-traverse").default;

import type { SourceText, Source } from "../types";

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

function parse(sourceText: SourceText, source: Source) {
  if (ASTs.has(source.id)) {
    return ASTs.get(source.id);
  }
  const ast = _parse(sourceText.text);
  ASTs.set(source.id, ast);
  return ast;
}

function getAst(source) {
  return ASTs.get(source.id);
}

function getFunctions(source) {
  const ast = getAst(source);

  traverse(ast, {
    enter(path) {}
  });

  return false;
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

function getPathClosestToLocation(source, location) {
  const ast = getAst(source);
  const pathClosestToLocation = null;

  traverse(ast, {
    enter(path) {
      if (nodeContainsLocation({ node: path.node, location })) {
        pathClosestToLocation = path;
      }
    }
  });

  return pathClosestToLocation;
}

module.exports = {
  parse,
  getFunctions,
  getPathClosestToLocation
};
