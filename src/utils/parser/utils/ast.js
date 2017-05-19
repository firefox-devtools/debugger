import parseScriptTags from "parse-script-tags";
import * as babylon from "babylon";
import traverse from "babel-traverse";
import isEmpty from "lodash/isEmpty";
import { isDevelopment } from "devtools-config";

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

export function getAst(sourceText: SourceText) {
  if (ASTs.has(sourceText.id)) {
    return ASTs.get(sourceText.id);
  }

  let ast = {};
  if (sourceText.contentType == "text/html") {
    // Custom parser for parse-script-tags that adapts its input structure to
    // our parser's signature
    const parser = ({ source, line }) => {
      return parse(source, {
        startLine: line
      });
    };
    ast = parseScriptTags(sourceText.text, parser) || {};
  } else if (sourceText.contentType == "text/javascript") {
    ast = parse(sourceText.text);
  }

  ASTs.set(sourceText.id, ast);
  return ast;
}

export function traverseAst(sourceText: SourceText, pattern) {
  const ast = getAst(sourceText);
  if (isEmpty(ast)) {
    return null;
  }

  traverse(ast, pattern);
}
