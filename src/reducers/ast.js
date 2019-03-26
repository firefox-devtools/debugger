/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Ast reducer
 * @module reducers/ast
 */

import type { AstLocation, SymbolDeclarations } from "../workers/parser";

import type { Source } from "../types";
import type { Action, DonePromiseAction } from "../actions/types";

type EmptyLinesType = number[];

export type Symbols = SymbolDeclarations | {| loading: true |};
export type EmptyLinesMap = { [k: string]: EmptyLinesType };
export type SymbolsMap = { [k: string]: Symbols };

export type SourceMetaDataType = {
  framework: ?string
};

export type SourceMetaDataMap = { [k: string]: SourceMetaDataType };

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
  +symbols: SymbolsMap,
  +emptyLines: EmptyLinesMap,
  +outOfScopeLocations: ?Array<AstLocation>,
  +inScopeLines: ?Array<number>,
  +preview: Preview,
  +sourceMetaData: SourceMetaDataMap
};

export function initialASTState(): ASTState {
  return {
    symbols: {},
    emptyLines: {},
    outOfScopeLocations: null,
    inScopeLines: null,
    preview: null,
    sourceMetaData: {}
  };
}

function update(state: ASTState = initialASTState(), action: Action): ASTState {
  switch (action.type) {
    case "SET_SYMBOLS": {
      const { sourceId } = action;
      if (action.status === "start") {
        return {
          ...state,
          symbols: { ...state.symbols, [sourceId]: { loading: true } }
        };
      }

      const value = ((action: any): DonePromiseAction).value;
      return {
        ...state,
        symbols: { ...state.symbols, [sourceId]: value }
      };
    }

    case "OUT_OF_SCOPE_LOCATIONS": {
      return { ...state, outOfScopeLocations: action.locations };
    }

    case "IN_SCOPE_LINES": {
      return { ...state, inScopeLines: action.lines };
    }

    case "CLEAR_SELECTION": {
      return { ...state, preview: null };
    }

    case "SET_PREVIEW": {
      if (action.status == "start") {
        return { ...state, preview: { updating: true } };
      }

      if (!action.value) {
        return { ...state, preview: null };
      }

      // NOTE: if the preview does not exist, it has been cleared
      if (state.preview) {
        return { ...state, preview: { ...action.value, updating: false } };
      }

      return state;
    }

    case "RESUME": {
      return { ...state, outOfScopeLocations: null };
    }

    case "NAVIGATE": {
      return initialASTState();
    }

    case "SET_SOURCE_METADATA": {
      const { sourceId, sourceMetaData } = action;
      return {
        ...state,
        sourceMetaData: { ...state.sourceMetaData, [sourceId]: sourceMetaData }
      };
    }

    default: {
      return state;
    }
  }
}

// NOTE: we'd like to have the app state fully typed
// https://github.com/firefox-devtools/debugger/blob/master/src/reducers/sources.js#L179-L185
type OuterState = { ast: ASTState };

export function getSymbols(state: OuterState, source: ?Source): ?Symbols {
  if (!source) {
    return null;
  }

  return state.ast.symbols[source.id] || null;
}

export function hasSymbols(state: OuterState, source: Source): boolean {
  const symbols = getSymbols(state, source);

  if (!symbols) {
    return false;
  }

  return !symbols.loading;
}

export function isSymbolsLoading(state: OuterState, source: ?Source): boolean {
  const symbols = getSymbols(state, source);
  if (!symbols) {
    return false;
  }

  return symbols.loading;
}

export function getOutOfScopeLocations(state: OuterState) {
  return state.ast.outOfScopeLocations;
}

export function getPreview(state: OuterState) {
  return state.ast.preview;
}

const emptySourceMetaData = {};
export function getSourceMetaData(state: OuterState, sourceId: string) {
  return state.ast.sourceMetaData[sourceId] || emptySourceMetaData;
}

export function hasSourceMetaData(state: OuterState, sourceId: string) {
  return state.ast.sourceMetaData[sourceId];
}

export function getInScopeLines(state: OuterState) {
  return state.ast.inScopeLines;
}

export function isLineInScope(state: OuterState, line: number) {
  const linesInScope = state.ast.inScopeLines;
  return linesInScope && linesInScope.includes(line);
}

export default update;
