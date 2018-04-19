/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import parseScriptTags from "parse-script-tags";
import * as babylon from "babylon";
import * as t from "@babel/types";
import isEmpty from "lodash/isEmpty";
import { getSource } from "../sources";

let ASTs = new Map();

function _parse(code, opts) {
  return babylon.parse(code, {
    ...opts,
    tokens: true
  });
}

const sourceOptions = {
  generated: {
    tokens: true,
    plugins: ["objectRestSpread"]
  },
  original: {
    sourceType: "unambiguous",
    tokens: true,
    plugins: [
      "jsx",
      "flow",
      "doExpressions",
      "decorators",
      "objectRestSpread",
      "classProperties",
      "exportDefaultFrom",
      "exportNamespaceFrom",
      "asyncGenerators",
      "functionBind",
      "functionSent",
      "dynamicImport",
      "react-jsx"
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
    console.error(error);
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

export function getAst(sourceId: string) {
  if (ASTs.has(sourceId)) {
    return ASTs.get(sourceId);
  }

  const source = getSource(sourceId);

  let ast = {};
  const { contentType } = source;
  if (contentType == "text/html") {
    ast = parseScriptTags(source.text, htmlParser) || {};
  } else if (contentType && contentType.match(/(javascript|jsx)/)) {
    const type = source.id.includes("original") ? "original" : "generated";
    const options = sourceOptions[type];
    ast = parse(source.text, options);
  } else if (contentType && contentType.match(/typescript/)) {
    const options = {
      ...sourceOptions.original,
      plugins: [
        ...sourceOptions.original.plugins.filter(
          p => p !== "flow" && p !== "decorators" && p !== "decorators2"
        ),
        "decorators",
        "typescript"
      ]
    };
    ast = parse(source.text, options);
  }

  ASTs.set(source.id, ast);
  return ast;
}

export function clearASTs() {
  ASTs = new Map();
}

type Visitor = { enter: Function };
export function traverseAst<T>(sourceId: string, visitor: Visitor, state?: T) {
  const ast = getAst(sourceId);
  if (isEmpty(ast)) {
    return null;
  }

  t.traverse(ast, visitor, state);
  return ast;
}
