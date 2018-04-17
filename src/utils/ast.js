/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { xor, range } from "lodash";
import { convertToList } from "./pause/pausePoints";

import type { Location, Source, ColumnPosition } from "../types";

import type {
  AstPosition,
  AstLocation,
  PausePoints,
  SymbolDeclarations
} from "../workers/parser";

export function findBestMatchExpression(
  symbols: SymbolDeclarations,
  tokenPos: ColumnPosition
) {
  const { memberExpressions, identifiers, literals } = symbols;
  const { line, column } = tokenPos;

  const members = memberExpressions.filter(({ computed }) => !computed);

  return []
    .concat(identifiers, members, literals)
    .reduce((found, expression) => {
      const overlaps =
        expression.location.start.line == line &&
        expression.location.start.column <= column &&
        expression.location.end.column >= column;

      if (overlaps) {
        return expression;
      }

      return found;
    }, null);
}

export function findEmptyLines(
  selectedSource: Source,
  pausePoints: PausePoints
) {
  if (!pausePoints || !selectedSource) {
    return [];
  }

  const pausePointsList = convertToList(pausePoints);

  const breakpoints = pausePointsList.filter(point => point.types.break);
  const breakpointLines = breakpoints.map(point => point.location.line);

  if (!selectedSource.text) {
    return [];
  }

  const lineCount = selectedSource.text.split("\n").length;
  const sourceLines = range(1, lineCount + 1);
  return xor(sourceLines, breakpointLines);
}

export function containsPosition(a: AstLocation, b: AstPosition) {
  const startsBefore =
    a.start.line < b.line ||
    (a.start.line === b.line && a.start.column <= b.column);
  const endsAfter =
    a.end.line > b.line || (a.end.line === b.line && a.end.column >= b.column);

  return startsBefore && endsAfter;
}

function findClosestofSymbol(declarations: any[], location: Location) {
  if (!declarations) {
    return null;
  }

  return declarations.reduce((found, currNode) => {
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

export function findClosestFunction(
  symbols: SymbolDeclarations,
  location: Location
) {
  const { functions } = symbols;
  return findClosestofSymbol(functions, location);
}

export function findClosestClass(
  symbols: SymbolDeclarations,
  location: Location
) {
  const { classes } = symbols;
  return findClosestofSymbol(classes, location);
}
