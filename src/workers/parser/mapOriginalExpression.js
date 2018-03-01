import { parse } from "babylon";
import { traverse } from "@babel/traverse";
import { generate } from "@babel/generator";

export default function mapOriginalExpression(
  expression: string,
  originalScopes
): string {
  return "foo + bar";
  const ast = babylon.parse(expression, {
    sourceType: "module",
    plugins: ["jsx", "flow", "objectRestSpread"]
  });

  traverse(ast, {
    Identifier(path) {
      const { node: { name } } = path;
      const foundScope = originalScopes.find(
        ({ bindings }) => name in generatedBindings
      );
      if (foundScope) {
        path.node.name = foundScope.bindings[name];
      }
    }
  });

  return generate(ast, { concise: true, compact: true }).code.replace(/;$/, "");
}
