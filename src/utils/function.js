/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { findClosestFunction } from "./ast";
import { correctIndentation } from "./indentation";

export function findFunctionText(line, source, symbols) {
  const func = findClosestFunction(symbols, {
    line,
    column: Infinity
  });
  if (!func) {
    return null;
  }

  const { location: { start, end } } = func;
  const lines = source.text.split("\n");
  const firstLine = lines[start.line - 1].slice(start.column);
  const lastLine = lines[end.line - 1].slice(0, end.column);
  const middle = lines.slice(start.line, end.line - 1);
  const functionText = [firstLine, ...middle, lastLine].join("\n");
  const indentedFunctionText = correctIndentation(functionText);

  return indentedFunctionText;
}
