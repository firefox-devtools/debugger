/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { without, range } from "lodash";

import type { Location, Source, ColumnPosition } from "../types";
import type {
  AstPosition,
  AstLocation,
  SymbolDeclarations,
  SymbolDeclaration,
  PausePoint
} from "../workers/parser";

export function findBestMatchExpression(
  symbols: SymbolDeclarations,
  tokenPos: ColumnPosition
) {
  const { memberExpressions, identifiers, literals } = symbols;
  const { line, column } = tokenPos;
  return identifiers
    .concat(memberExpressions, literals)
    .reduce((found, expression) => {
      const overlaps =
        expression.location.start.line == line &&
        expression.location.start.column <= column &&
        expression.location.end.column >= column &&
        !expression.computed;

      if (overlaps) {
        return expression;
      }

      return found;
    }, null);
}

export function findEmptyLines(
  selectedSource: Source,
  pausePoints: PausePoint[]
) {
  if (!pausePoints || pausePoints.length == 0 || !selectedSource) {
    return [];
  }

  const breakpoints = pausePoints.filter(point => point.types.breakpoint);
  const breakpointLines = breakpoints.map(point => point.location.line);

  if (!selectedSource.text) {
    return [];
  }
  const lineCount = selectedSource.text.split("\n").length;
  const sourceLines = range(1, lineCount + 1);
  return without(sourceLines, ...breakpointLines);
}

export function containsPosition(a: AstLocation, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line || (a.end.line === b.line && a.end.column >= b.column);

  return startsBefore && endsAfter;
}

export function findClosestFunction(
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
