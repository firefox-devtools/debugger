/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import getSymbols from "../getSymbols";

function formatLocation(loc) {
  if (!loc) {
    return "";
  }

  const { start, end } = loc;
  const startLoc = `(${start.line}, ${start.column})`;

  const endLoc = `(${end.line}, ${end.column})`;

  return `[${startLoc}, ${endLoc}]`;
}

function summarize(symbol) {
  if (typeof symbol == "boolean") {
    return symbol ? "true" : "false";
  }

  const loc = formatLocation(symbol.location);

  const exprLoc = formatLocation(symbol.expressionLocation);

  const params = symbol.parameterNames
    ? `(${symbol.parameterNames.join(", ")})`
    : "";

  const expression = symbol.expression || "";

  const klass = symbol.klass || "";

  const name = symbol.name || "";

  const names = symbol.specifiers ? symbol.specifiers.join(", ") : "";

  const values = symbol.values ? symbol.values.join(", ") : "";

  return `${loc} ${exprLoc} ${expression} ${name}${params} ${klass} ${names} ${
    values
  }`.trim(); // eslint-disable-line max-len
}

function formatKey(name, symbols) {
  if (name == "hasJSX") {
    return `hasJSX: ${symbols.hasJSX[0] ? "true" : "false"}`;
  }

  return `${name}:\n${symbols[name].map(summarize).join("\n")}`;
}

export function formatSymbols(source: Source) {
  const symbols = getSymbols(source);

  return Object.keys(symbols)

    .map(name => formatKey(name, symbols))

    .join("\n\n");
}
