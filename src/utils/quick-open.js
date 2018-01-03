/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { endTruncateStr } from "./utils";
import { isPretty, getSourcePath, isThirdParty } from "./source";

import type { Location as BabelLocation } from "babel-traverse";
import type { SourcesMap } from "../reducers/sources";
import type { QuickOpenType } from "../reducers/quick-open";
import type {
  SymbolDeclaration,
  SymbolDeclarations
} from "../workers/parser/types";

export const QUICKOPEN_MODIFIERS = {
  "@": "functions",
  "#": "variables",
  ":": "goto",
  "?": "shortcuts"
};

export function parseQuickOpenQuery(query: string): QuickOpenType {
  const modifierPattern = /^@|#|:|\?$/;
  const gotoSourcePattern = /^(\w+)\:/;
  const startsWithModifier = modifierPattern.test(query[0]);
  const isGotoSource = gotoSourcePattern.test(query);

  if (startsWithModifier) {
    const modifier = query[0];
    return QUICKOPEN_MODIFIERS[modifier];
  }

  if (isGotoSource) {
    return "gotoSource";
  }

  return "sources";
}

export function parseLineColumn(query: string) {
  const [, line, column] = query.split(":");
  const lineNumber = parseInt(line, 10);
  const columnNumber = parseInt(column, 10);
  if (!isNaN(lineNumber)) {
    return {
      line: lineNumber,
      ...(!isNaN(columnNumber) ? { column: columnNumber } : null)
    };
  }
}

export type QuickOpenResult = {|
  id: string,
  value: string,
  title: string,
  subtitle?: string,
  location?: BabelLocation
|};

export type FormattedSymbolDeclarations = {|
  variables: Array<QuickOpenResult>,
  functions: Array<QuickOpenResult>
|};

export function formatSymbol(symbol: SymbolDeclaration): QuickOpenResult {
  return {
    id: `${symbol.name}:${symbol.location.start.line}`,
    title: symbol.name,
    subtitle: `${symbol.location.start.line}`,
    value: symbol.name,
    location: symbol.location
  };
}

export function formatSymbols(
  symbols: ?SymbolDeclarations
): FormattedSymbolDeclarations {
  if (!symbols) {
    return { variables: [], functions: [] };
  }

  const { variables, functions } = symbols;

  return {
    variables: variables.map(formatSymbol),
    functions: functions.map(formatSymbol)
  };
}

export function formatShortcutResults(): Array<QuickOpenResult> {
  return [
    {
      value: "Seach for a function in a file",
      title: "@ Function Search",
      id: "@"
    },
    {
      value: "Search forr a variable in a file",
      title: "# Variable Search",
      id: "#"
    },
    {
      value: "Go to a line number in a file",
      title: ": Go to line",
      id: ":"
    }
  ];
}

export function formatSources(sources: SourcesMap): Array<QuickOpenResult> {
  return sources
    .valueSeq()
    .filter(source => !isPretty(source) && !isThirdParty(source))
    .map(source => {
      const sourcePath = getSourcePath(source.get("url"));
      return {
        value: sourcePath,
        title: sourcePath.split("/").pop(),
        subtitle: endTruncateStr(sourcePath, 100),
        id: source.get("id")
      };
    })
    .filter(({ value }) => value != "")
    .toJS();
}
