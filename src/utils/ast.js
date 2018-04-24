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
  SymbolDeclarations,
  SymbolDeclaration
} from "../workers/parser";

type ExtraProps = { hasJsx: boolean, hasTypes: boolean };

type ArraySymbolDeclarations = $Values<$Diff<SymbolDeclarations, ExtraProps>>;

function isOverlapping(
  expression: SymbolDeclaration,
  { line, column }: ColumnPosition
) {
  const { start } = expression.location;
  if (start.line < line) {
    return -1;
  }
  if (start.line > line) {
    return 1;
  }

  return 0;
}

export function lowerBound(
  array: ArraySymbolDeclarations,
  query: ColumnPosition,
  cmp: (any, ColumnPosition) => number
) {
  const length = array.length;
  let left = 0;
  let right = length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const result = cmp(array[mid], query);
    if (result == 0) {
      right = mid;
    } else if (result > 0) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

function upperBound(
  array: ArraySymbolDeclarations,
  query: ColumnPosition,
  cmp: (any, ColumnPosition) => number
) {
  const length = array.length;
  let left = 0;
  let right = length - 1;

  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    const result = cmp(array[mid], query);
    if (result == 0) {
      left = mid;
    } else if (result > 0) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

function findOverlapping(
  array: ArraySymbolDeclarations,
  location: ColumnPosition
) {
  // Returns the declarations which are in same line of `location`
  const l = lowerBound(array, location, isOverlapping);
  const u = upperBound(array, location, isOverlapping);
  return array.slice(l, u + 1);
}

export function findBestMatchExpression(
  symbols: SymbolDeclarations,
  tokenPos: ColumnPosition
) {
  let { memberExpressions, identifiers, literals } = symbols;
  const { line, column } = tokenPos;

  let members = findOverlapping(memberExpressions, tokenPos);
  members = memberExpressions.filter(({ computed }) => !computed);
  identifiers = findOverlapping(identifiers, tokenPos);
  literals = findOverlapping(literals, tokenPos);

  const reducedSymbols = [].concat(literals, members, identifiers);

  for (let index = 0; index < reducedSymbols.length; index++) {
    const expression = reducedSymbols[index];
    const overlaps =
      expression.location.start.line == line &&
      expression.location.start.column <= column &&
      expression.location.end.column >= column;

    if (overlaps) {
      return expression;
    }
  }

  return null;
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

  if (!selectedSource.text || breakpointLines.length == 0) {
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
