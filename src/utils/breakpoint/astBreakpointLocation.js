import { getSymbols } from "../parser";
import { containsPosition } from "../parser/utils/helpers";

import type { Location, Source } from "debugger-html";

export async function getASTLocation(source: Source, location: Location) {
  const symbols = await getSymbols(source);
  const functions = symbols.functions;

  const scope = functions.find(node => {
    return containsPosition(node.location, location) && node.name;
  });
  if (scope) {
    const line = location.line - scope.location.start.line;
    const column = location.column;
    return { scope, offset: { line, column } };
  }
  return { scope: { name: undefined }, offset: location };
}

export async function findScopeByName(source: Source, name: String) {
  const symbols = await getSymbols(source);
  const functions = symbols.functions;

  return functions.find(node => node.name === name);
}
