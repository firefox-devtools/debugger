import { getSymbols } from "../parser";
import { containsPosition } from "../parser/utils/helpers";

import type { Location, Source } from "debugger-html";

function findClosestScope(functions, location) {
  return functions.reduce((found, currNode) => {
    if (
      currNode.name === "anonymous" ||
      !containsPosition(currNode.location, location)
    ) {
      return found;
    }

    if (!found) {
      return currNode;
    }

    if (
      found.location.start.line > currNode.location.start.line ||
      found.location.start.column > currNode.location.start.column
    ) {
      return found;
    }

    return currNode;
  }, null);
}

export async function getASTLocation(source: Source, location: Location) {
  const symbols = await getSymbols(source);
  const functions = [...symbols.functions, ...symbols.memberExpressions];

  const scope = findClosestScope(functions, location);
  if (scope) {
    const line = location.line - scope.location.start.line;
    const column = location.column;
    return { name: scope.name, offset: { line, column } };
  }
  return { name: undefined, offset: location };
}

export async function findScopeByName(source: Source, name: String) {
  const symbols = await getSymbols(source);
  const functions = symbols.functions;

  return functions.find(node => node.name === name);
}
