/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { endTruncateStr } from "./utils";
import { isPretty, getSourcePath } from "./source";

import type { Location as BabelLocation } from "@babel/types";
import type { SourcesMap } from "../reducers/sources";
import type { Symbols } from "../reducers/ast";
import type { QuickOpenType } from "../reducers/quick-open";
import type { SymbolDeclaration } from "../workers/parser";
import type { Source } from "../types";

export const MODIFIERS = {
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
    return MODIFIERS[modifier];
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

export function formatSourcesForProjectDirectoryRoot(
  source: Source,
  projectDirectoryRoot: string
) {
  const sourcePath = getSourcePath(source.get("url"));
  let title = "";
  let subtitle = "";

  if (sourcePath) {
    const sourcePathSplit = sourcePath.split("/");

    // Remove leading "/"
    if (sourcePathSplit[0] === "") {
      sourcePathSplit.shift();
    }

    // Make the title the file name
    title = sourcePathSplit.pop().split("?")[0];

    // Rebuild the sourcePath
    let newSourcePath = sourcePathSplit.join("/");

    if (projectDirectoryRoot != "") {
      // Remove the domain from the source path
      const projectDirectoryRootSplit = projectDirectoryRoot.split("/");
      // Remove the first item, which is "/"
      projectDirectoryRootSplit.shift();
      // Remove the domain
      projectDirectoryRootSplit.shift();

      // Remove the directory root, if it matches, from the source path
      const projectDirectoryJoined = projectDirectoryRootSplit.join("/");
      if (newSourcePath.includes(projectDirectoryJoined)) {
        newSourcePath = newSourcePath.replace(projectDirectoryJoined, "");
      }
    }

    // Make the subtitle the remaining info
    subtitle = endTruncateStr(newSourcePath, 100);
  }

  return {
    value: sourcePath,
    title,
    subtitle,
    id: source.get("id"),
    url: source.get("url")
  };
}

export type QuickOpenResult = {|
  id: string,
  value: string,
  title: string,
  subtitle?: string,
  location?: BabelLocation,
  url?: string
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

export function formatSymbols(symbols: ?Symbols): FormattedSymbolDeclarations {
  if (!symbols || symbols.loading) {
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
      value: L10N.getStr("symbolSearch.search.functionsPlaceholder.title"),
      title: `@ ${L10N.getStr("symbolSearch.search.functionsPlaceholder")}`,
      id: "@"
    },
    {
      value: L10N.getStr("symbolSearch.search.variablesPlaceholder.title"),
      title: `# ${L10N.getStr("symbolSearch.search.variablesPlaceholder")}`,
      id: "#"
    },
    {
      value: L10N.getStr("gotoLineModal.title"),
      title: `: ${L10N.getStr("gotoLineModal.placeholder")}`,
      id: ":"
    }
  ];
}

export function formatSources(
  sources: SourcesMap,
  root: string
): Array<QuickOpenResult> {
  return sources
    .valueSeq()
    .filter(source => !isPretty(source))
    .map(source => formatSourcesForProjectDirectoryRoot(source, root))
    .filter(({ value }) => value != "")
    .toJS();
}
