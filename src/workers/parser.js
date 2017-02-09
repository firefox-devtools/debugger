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

module.exports = {
  parse,
  getFunctions
};
