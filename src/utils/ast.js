/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { without, range } from "lodash";

import type { Source, Position } from "../types";
import type { PausePoint, SymbolDeclarations } from "../workers/parser";

export function findBestMatchExpression(
  symbols: SymbolDeclarations,
  tokenPos: Position
) {
  const { memberExpressions, identifiers } = symbols;
  const { line, column } = tokenPos;
  return identifiers.concat(memberExpressions).reduce((found, expression) => {
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
  if (!pausePoints || !selectedSource) {
    return [];
  }

  const breakpoints = pausePoints.filter(point => point.types.breakpoint);
  const breakpointLines = breakpoints.map(point => point.location.line);

  if (!selectedSource.text) {
    return [];
  }
  const lineCount = selectedSource.text.split("\n").length;
  const sourceLines = range(1, lineCount);
  return without(sourceLines, ...breakpointLines);
}
