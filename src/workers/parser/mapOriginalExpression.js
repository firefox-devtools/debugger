/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parseScript } from "./utils/ast";
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

export default function mapOriginalExpression(
  expression: string,
  mappings: {
    [string]: string | null
  }
): string {
  let didReplace = false;

  const ast = parseScript(expression);
  t.traverse(ast, (node, ancestors) => {
    const parent = ancestors[ancestors.length - 1];
    if (!parent) {
      return;
    }

    const parentNode = parent.node;
    if (t.isIdentifier(node) && t.isReferenced(node, parentNode)) {
      if (mappings.hasOwnProperty(node.name)) {
        const mapping = mappings[node.name];
        if (mapping && mapping !== node.name) {
          const mappingNode = getFirstExpression(parseScript(mapping));
          replaceNode(ancestors, mappingNode);

          didReplace = true;
        }
      }
    }
  });

  if (!didReplace) {
    // Avoid the extra code generation work and also avoid potentially
    // reformatting the user's code unnecessarily.
    return expression;
  }

  return generate(ast).code;
}
