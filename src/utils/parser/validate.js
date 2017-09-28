// @flow

import { parseExpression } from "./utils/ast";

export function hasSyntaxError(input: string) {
  try {
    parseExpression(input);
    return false;
  } catch (e) {
    return `${e.name} : ${e.message}`;
  }
}
