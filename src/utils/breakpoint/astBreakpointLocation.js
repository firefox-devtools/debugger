/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSymbols } from "../../workers/parser";

import type {
  AstPosition,
  AstLocation,
  SymbolDeclarations,
  SymbolDeclaration
} from "../../workers/parser";

import type {
  Range,
  Location,
  Position,
  Source,
  ASTLocation
} from "../../types";

export function containsPosition(a: AstLocation, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line ||
    (a.end.line === b.line && a.start.column >= b.column);

  return startsBefore && endsAfter;
}

export function findClosestScope(
  functions: SymbolDeclaration[],
  location: Location
) {
  return functions.reduce((found, currNode) => {
    if (
      currNode.name === "anonymous" ||
      !containsPosition(currNode.location, {
        line: location.line,
        column: location.column || 0
      })
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

export function getASTLocation(
  source: Source,
  symbols: SymbolDeclarations,
  location: Location
): ASTLocation {
  if (source.isWasm || !symbols || symbols.loading) {
    return { name: undefined, offset: location };
  }

  const functions = [...symbols.functions];

  const scope = findClosestScope(functions, location);
  if (scope) {
    // we only record the line, but at some point we may
    // also do column offsets
    const line = location.line - scope.location.start.line;
    return {
      name: scope.name,
      offset: { line, column: undefined }
    };
  }
  return { name: undefined, offset: location };
}

export async function findScopeByName(source: Source, name: ?string) {
  const symbols = await getSymbols(source.id);
  const functions = symbols.functions;

  return functions.find(node => node.name === name);
}
