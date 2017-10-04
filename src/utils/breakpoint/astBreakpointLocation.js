// @flow

import { getSymbols } from "../../workers/parser";

import type { Scope, AstPosition } from "../../workers/parser/types";
import type { Location, Source } from "debugger-html";

export function containsPosition(a: AstPosition, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line || (a.end.line === b.line && a.end.column >= b.column);

  return startsBefore && endsAfter;
}

export function findClosestScope(functions: Scope[], location: Location) {
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

    if (found.location.start.line > currNode.location.start.line) {
      return found;
    }
    if (
      found.location.start.line === currNode.location.start.line &&
      found.location.start.column > currNode.location.start.column
    ) {
      return found;
    }

    return currNode;
  }, null);
}

export async function getASTLocation(source: Source, location: Location) {
  const symbols = await getSymbols(source);
  const functions = [...symbols.functions];

  const scope = findClosestScope(functions, location);
  if (scope) {
    // we only record the line, but at some point we may
    // also do column offsets
    const line = location.line - scope.location.start.line;
    return {
      name: scope.name,
      offset: { line }
    };
  }
  return { name: undefined, offset: location };
}

export async function findScopeByName(source: Source, name: String) {
  const symbols = await getSymbols(source);
  const functions = symbols.functions;

  return functions.find(node => node.name === name);
}
