// @flow

/**
 * UI reducer
 * @module reducers/ui
 */

import * as I from "immutable";

import makeRecord from "../utils/makeRecord";
import type { SymbolDeclarations, AstLocation } from "../utils/parser/types";

import type { Map } from "immutable";
import type { Source } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SymbolsMap = Map<string, SymbolDeclarations>;

export type Selection =
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
  outOfScopeLocations: ?Array<AstLocation>,
  selection: Selection
};

export function initialState() {
  return makeRecord(
    ({
      symbols: I.Map(),
      outOfScopeLocations: null,
      selection: null
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

    case "OUT_OF_SCOPE_LOCATIONS": {
      return state.set("outOfScopeLocations", action.locations);
    }

    case "CLEAR_SELECTION": {
      return state.set("selection", null);
    }

    case "SET_SELECTION": {
      if (action.status == "start") {
        return state.set("selection", { updating: true });
      }

      if (!action.value) {
        return state.set("selection", null);
      }

      const {
        expression,
        location,
        result,
        tokenPos,
        cursorPos
      } = action.value;
      return state.set("selection", {
        updating: false,
        expression,
        location,
        result,
        tokenPos,
        cursorPos
      });
    }

    case "RESUMED": {
      return state.set("outOfScopeLocations", null);
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

export function getOutOfScopeLocations(state: OuterState) {
  return state.ast.get("outOfScopeLocations");
}

export function getSelection(state: OuterState) {
  return state.ast.get("selection");
}

export default update;
