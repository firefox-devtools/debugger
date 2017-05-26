// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

import * as I from "immutable";

// import type { Action } from "../actions/types";
// import type { Source } from "debugger-html";
// import type { Map } from "immutable";
import makeRecord from "../utils/makeRecord";
import type { SymbolDeclarations } from "../utils/parser/getSymbols";

import type { Map } from "immutable";
import type { Source } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SymbolsMap = Map<string, SymbolDeclarations>;

export type ASTState = {
  symbols: SymbolsMap
};

export function initialState() {
  return makeRecord(
    ({
      symbols: I.Map()
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

export default update;
