/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import parseScriptTags from "parse-script-tags";
import * as babylon from "babylon";
import traverse from "babel-traverse";
import isEmpty from "lodash/isEmpty";

import type { Source } from "debugger-html";

let ASTs = new Map();

function _parse(code, opts) {
  return babylon.parse(code, opts);
}

const sourceOptions = {
  generated: {},
  original: {
    sourceType: "module",
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "objectRestSpread",
      "classProperties",
      "exportExtensions",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "templateInvalidEscapes"
    ]
  }
};

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
  return parse(source, { startLine: line });
}

export function parseScript(text: string, opts?: Object) {
  return _parse(text, opts);
}

export function getAst(source: Source) {
  if (!source || !source.text) {
    return {};
  }

  if (ASTs.has(source.id)) {
    return ASTs.get(source.id);
  }

  let ast = {};
  const { contentType } = source;
  if (contentType == "text/html") {
    ast = parseScriptTags(source.text, htmlParser) || {};
  } else if (contentType && contentType.match(/(javascript|jsx)/)) {
    const type = source.id.includes("original") ? "original" : "generated";
    const options = sourceOptions[type];
    ast = parse(source.text, options);
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
