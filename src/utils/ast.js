/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Position } from "../types";
import type { SymbolDeclarations } from "../workers/parser";

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
  }, {});
}
