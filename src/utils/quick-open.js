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

export function parseQuickOpenQuery(query: string): QuickOpenType {
  const modifierPattern = /^@|#|\:$/;
  const gotoSourcePattern = /^(\w+)\:/;
  const startsWithModifier = modifierPattern.test(query[0]);
  const isGotoSource = gotoSourcePattern.test(query);

  if (startsWithModifier) {
    const modifiers = {
      "@": "functions",
      "#": "variables",
      ":": "goto"
    };
    const modifier = query[0];
    return modifiers[modifier];
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

export type FormattedSymbolDeclaration = {|
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: BabelLocation
|};

export type FormattedSymbolDeclarations = {|
  variables: Array<FormattedSymbolDeclaration>,
  functions: Array<FormattedSymbolDeclaration>
|};

export type FormattedSource = {|
  value: string,
  title: string,
  subtitle: string,
  id: string
|};

export function formatSymbol(
  symbol: SymbolDeclaration
): FormattedSymbolDeclaration {
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

export function formatSources(sources: SourcesMap): Array<FormattedSource> {
  return sources
    .valueSeq()
    .toJS()
    .filter(source => !isPretty(source) && !isThirdParty(source))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source)
        .split("/")
        .pop(),
      subtitle: endTruncateStr(getSourcePath(source), 100),
      id: source.id
    }))
    .filter(formattedSource => formattedSource.value != "");
}
