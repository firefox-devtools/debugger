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
        if (mapping) {
          const mappingNode = getFirstExpression(parseScript(mapping));

          replaceNode(ancestors, mappingNode);
        }
      }
    }
  });

  return generate(ast, { concise: true }).code;
}
