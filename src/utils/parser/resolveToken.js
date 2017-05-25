// @flow

import { getClosestExpression, getClosestScope } from "./utils/closest";
import { isExpressionInScope } from "./scopes";

import type { SourceText, Location, Frame } from "debugger-html";

// Resolves a token (at location) in the source to determine if it is in scope
// of the given frame and the expression (if any) to which it belongs
export default function resolveToken(
  source: SourceText,
  token: string,
  location: Location,
  frame: Frame
) {
  const expression = getClosestExpression(source, token, location);
  const scope = getClosestScope(source, location);

  if (!expression || !expression.value || !scope) {
    return { expression: null, inScope: false };
  }

  const inScope = isExpressionInScope(expression.value, scope);

  return {
    expression,
    inScope
  };
}
