/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import template from "@babel/template";
import generate from "@babel/generator";
import * as t from "@babel/types";

import { parse, hasNode } from "./utils/ast";
import { isTopLevel } from "./utils/helpers";

function hasTopLevelAwait(expression: string) {
  const ast = parse(expression, { allowAwaitOutsideFunction: true });
  const hasAwait = hasNode(
    ast,
    (node, ancestors, b) => t.isAwaitExpression(node) && isTopLevel(ancestors)
  );

  return hasAwait && ast;
}

function wrapExpression(ast) {
  const statements = ast.program.body;
  const lastStatement = statements[statements.length - 1];
  const body = statements
    .slice(0, -1)
    .concat(t.returnStatement(lastStatement.expression));

  const newAst = t.arrowFunctionExpression([], t.blockStatement(body), true);
  return generate(newAst).code;
}

export default function handleTopLevelAwait(expression: string) {
  const ast = hasTopLevelAwait(expression);
  if (ast) {
    const func = wrapExpression(ast);
    return generate(template.ast(`(${func})().then(r => console.log(r));`))
      .code;
  }

  return expression;
}
