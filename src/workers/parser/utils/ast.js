// @flow

import parseScriptTags from "parse-script-tags";
import * as babylon from "babylon";
import traverse from "babel-traverse";
import isEmpty from "lodash/isEmpty";

import type { Source } from "debugger-html";

let ASTs = new Map();

function _parse(code, opts) {
  return babylon.parse(
    code,
    Object.assign({}, opts, {
      sourceType: "module",
      plugins: ["jsx", "flow", "objectRestSpread"]
    })
  );
}

function parse(text: ?string, opts?: Object) {
  let ast;
  if (!text) {
    return;
  }

  try {
    ast = _parse(text, opts);
  } catch (error) {
    ast = {};
  }

  return ast;
}

// Custom parser for parse-script-tags that adapts its input structure to
// our parser's signature
function htmlParser({ source, line }) {
  return parse(source, {
    startLine: line
  });
}

export function parseExpression(expression: string, opts?: Object) {
  return babylon.parseExpression(
    expression,
    Object.assign({}, opts, { sourceType: "script" })
  );
}

export function getAst(source: Source) {
  if (!source || !source.text) {
    return {};
  }

  if (ASTs.has(source.id)) {
    return ASTs.get(source.id);
  }

  let ast = {};
  if (source.contentType == "text/html") {
    ast = parseScriptTags(source.text, htmlParser) || {};
  } else if (source.contentType == "text/javascript") {
    ast = parse(source.text);
  }

  ASTs.set(source.id, ast);
  return ast;
}

export function clearASTs() {
  ASTs = new Map();
}

type Visitor = { enter: Function };
export function traverseAst(source: Source, visitor: Visitor) {
  const ast = getAst(source);
  if (isEmpty(ast)) {
    return null;
  }

  traverse(ast, visitor);
  return ast;
}
