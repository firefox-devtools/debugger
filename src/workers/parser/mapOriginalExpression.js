/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { ColumnPosition } from "../../types";
import { parseScript } from "./utils/ast";
import { buildScopeList } from "./getScopes";
import generate from "@babel/generator";
import * as t from "@babel/types";

// NOTE: this will only work if we are replacing an original identifier
function replaceNode(ancestors, node) {
  const ancestor = ancestors[ancestors.length - 1];

  if (typeof ancestor.index === "number") {
    ancestor.node[ancestor.key][ancestor.index] = node;
  } else {
    ancestor.node[ancestor.key] = node;
  }
}

function getFirstExpression(ast) {
  const statements = ast.program.body;
  if (statements.length == 0) {
    return null;
  }

  return statements[0].expression;
}

function locationKey(start: ColumnPosition): string {
  return `${start.line}:${start.column}`;
}

function getReplacements(ast, mappings) {
  if (!mappings) {
    return {}
  }

  const scopes = buildScopeList(ast, "");
  const nodes = new Map();
  const replacements = new Map();

  // The ref-only global bindings are the ones that are accessed, but not
  // declared anywhere in the parsed code, meaning they are either global,
  // or declared somewhere in a scope outside the parsed code, so we
  // rewrite all of those specifically to avoid rewritting declarations that
  // shadow outer mappings.
  for (const name of Object.keys(scopes[0].bindings)) {
    const { refs } = scopes[0].bindings[name];
    const mapping = mappings[name];
    if (
      !refs.every(ref => ref.type === "ref") ||
      !mapping ||
      mapping === name
    ) {
      continue;
    }

    let node = nodes.get(name);
    if (!node) {
      node = getFirstExpression(parseScript(mapping));
      nodes.set(name, node);
    }

    for (const ref of refs) {
      let { line, column } = ref.start;

      // This shouldn't happen, just keeping Flow happy.
      if (typeof column !== "number") {
        column = 0;
      }

      replacements.set(locationKey({ line, column }), node);
    }
  }

  return replacements;
}

export default function mapOriginalExpression(
  expression: string,
  mappings: {
    [string]: string | null
  }
): string {
  const ast = parseScript(expression);
  const replacements = getReplacements(ast, mappings)

  let didUpdate = false;
  t.traverse(ast, (node, ancestors) => {
    const parent = ancestors[ancestors.length - 1];
    if (!parent) {
      return;
    }
    const parentNode = parent.node;

    if (replacements.size > 0 && (t.isIdentifier(node) || t.isThisExpression(node))) {
      const replacement = replacements.get(locationKey(node.loc.start));
      if (replacement) {
        didUpdate = true;
        replaceNode(ancestors, t.cloneNode(replacement));
      }
    }


    if (t.isVariableDeclaration(node) && !t.isBlockStatement(parentNode)) {
      const parts = node.declarations.map(({ id, init }) => {
        if (init) {
          return t.ifStatement(
            t.unaryExpression(
              "!",
              t.callExpression(
                t.memberExpression(
                  t.identifier("window"),
                  t.identifier("hasOwnProperty")
                ),
                [t.stringLiteral(id.name)]
              )
            ),
            t.expressionStatement(
              t.assignmentExpression(
                "=",
                t.memberExpression(t.identifier("window"), id),
                init
              )
            )
          );
        }
      });

      didUpdate = true
      const lastAncestor = ancestors[ancestors.length - 1];
      const { index } = lastAncestor;
      parent.node[parent.key].splice(index, 1, ...parts);
    }
  });

  const mappedExpression = didUpdate ? generate(ast).code : expression;
  return mappedExpression;
}
