/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Ast reducer
 * @module reducers/ast
 */

import * as I from "immutable";

import makeRecord from "../utils/makeRecord";
import type { SymbolDeclarations, AstLocation } from "../workers/parser/types";

import type { Map } from "immutable";
import type { Source } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type EmptyLinesType = number[];
export type SymbolsMap = Map<string, SymbolDeclarations>;
export type EmptyLinesMap = Map<string, EmptyLinesType>;

export type SourceMetaDataType = {
  isReactComponent: boolean
};

export type SourceMetaDataMap = Map<string, SourceMetaDataType>;

export type Preview =
  | {| updating: true |}
  | null
  | {|
      updating: false,
      expression: string,
      location: AstLocation,
      cursorPos: any,
      tokenPos: AstLocation,
      result: Object
    |};

export type ASTState = {
  symbols: SymbolsMap,
  emptyLines: EmptyLinesMap,
  outOfScopeLocations: ?Array<AstLocation>,
  preview: Preview,
  sourceMetaData: SourceMetaDataMap
};

export function initialState() {
  return makeRecord(
    ({
      symbols: I.Map(),
      emptyLines: I.Map(),
      outOfScopeLocations: null,
      preview: null,
      sourceMetaData: I.Map()
    }: ASTState)
  )();
}

function update(
  state: Record<ASTState> = initialState(),
  action: Action
): Record<ASTState> {
  switch (action.type) {
    case "SET_SYMBOLS": {
      const { source, symbols } = action;
      return state.setIn(["symbols", source.id], symbols);
    }

    case "SET_EMPTY_LINES": {
      const { source, emptyLines } = action;
      return state.setIn(["emptyLines", source.id], emptyLines);
    }

    case "OUT_OF_SCOPE_LOCATIONS": {
      return state.set("outOfScopeLocations", action.locations);
    }

    case "CLEAR_SELECTION": {
      return state.set("preview", null);
    }

    case "SET_PREVIEW": {
      if (action.status == "start") {
        return state.set("preview", { updating: true });
      }

      if (!action.value) {
        return state.set("preview", null);
      }

      const {
        expression,
        location,
        result,
        tokenPos,
        cursorPos,
        extra
      } = action.value;
      return state.set("preview", {
        updating: false,
        expression,
        location,
        result,
        tokenPos,
        cursorPos,
        extra
      });
    }

    case "RESUMED": {
      return state.set("outOfScopeLocations", null);
    }

    case "NAVIGATE": {
      return initialState();
    }

    case "SET_SOURCE_METADATA": {
      return state.setIn(
        ["sourceMetaData", action.sourceId],
        action.sourceMetaData
      );
    }

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/devtools-html/debugger.html/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ast: Record<ASTState> };

export function getSymbols(
  state: OuterState,
  source: Source
): SymbolDeclarations {
  const emptySet = { variables: [], functions: [] };
  if (!source) {
    return emptySet;
  }

  const symbols = state.ast.getIn(["symbols", source.id]);
  return symbols || emptySet;
}

export function hasSymbols(state: OuterState, source: Source): boolean {
  if (!source) {
    return false;
  }

  return !!state.ast.getIn(["symbols", source.id]);
}

export function isEmptyLineInSource(
  state: OuterState,
  line: number,
  selectedSource: Source
) {
  const emptyLines = getEmptyLines(state, selectedSource);
  return emptyLines.includes(line);
}

export function getEmptyLines(state: OuterState, source: Source) {
  if (!source) {
    return [];
  }

  return state.ast.getIn(["emptyLines", source.id]) || [];
}

export function getOutOfScopeLocations(state: OuterState) {
  return state.ast.get("outOfScopeLocations");
}

export function getPreview(state: OuterState) {
  return state.ast.get("preview");
}

export function getSourceMetaData(state: OuterState, sourceId: string) {
  return state.ast.getIn(["sourceMetaData", sourceId]) || {};
}

export default update;
