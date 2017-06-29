// @flow

import parseScriptTags from "parse-script-tags";
import * as babylon from "babylon";
import traverse from "babel-traverse";
import isEmpty from "lodash/isEmpty";
import { isDevelopment } from "devtools-config";

import type { Source } from "debugger-html";

const ASTs = new Map();

function _parse(code, opts) {
  return babylon.parse(
    code,
    Object.assign({}, opts, {
      sourceType: "module",
      plugins: ["jsx", "flow"]
    })
  );
}

function parse(text: string, opts?: Object) {
  let ast;
  if (!text) {
    return;
  }

  try {
    ast = _parse(text, opts);
  } catch (error) {
    if (isDevelopment()) {
      console.warn("parse failed", text);
    }

    ast = {};
  }

  return ast;
}

export function getAst(source: Source) {
  if (ASTs.has(source.id)) {
    return ASTs.get(source.id);
  }

  let ast = {};
  if (source.contentType == "text/html") {
    // Custom parser for parse-script-tags that adapts its input structure to
    // our parser's signature
    const parser = ({ sourceText, line }) => {
      return parse(sourceText, {
        startLine: line
      });
    };
    ast = parseScriptTags(source.text, parser) || {};
  } else if (source.contentType == "text/javascript") {
    const text = source.text || "";
    ast = parse(text);
  }

  ASTs.set(source.id, ast);
  return ast;
}

type Visitor = { enter: Function };
export function traverseAst(source: Source, visitor: Visitor) {
  const ast = getAst(source);
  if (isEmpty(ast)) {
    return null;
  }

  traverse(ast, visitor);
}
