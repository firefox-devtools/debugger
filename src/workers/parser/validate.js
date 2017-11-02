// @flow

import { parseScript } from "./utils/ast";

export function hasSyntaxError(input: string) {
  try {
    parseScript(input);
    return false;
  } catch (e) {
    return `${e.name} : ${e.message}`;
  }
}
