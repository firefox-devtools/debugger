// @flow

import {
  getSource,
  hasSymbols,
  getSelectedLocation,
  getSelectedSource,
  getSelectedFrame,
  getPreview
} from "../selectors";

import { PROMISE } from "../utils/redux/middleware/promise";
import * as parser from "../utils/parser";

import type { SourceId } from "debugger-html";
import type { ThunkArgs } from "./types";
import type { AstLocation } from "../utils/parser";

export function setSymbols(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (!sourceRecord) {
      return;
    }

    const source = sourceRecord.toJS();
    if (!source.text || hasSymbols(getState(), source)) {
      return;
    }

    const symbols = await parser.getSymbols(source);

    dispatch({
      type: "SET_SYMBOLS",
      source,
      symbols
    });
  };
}

export function setOutOfScopeLocations() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const location = getSelectedLocation(getState());
    if (!location) {
      return;
    }

    const source = getSource(getState(), location.sourceId);

    if (!location.line || !source) {
      return dispatch({
        type: "OUT_OF_SCOPE_LOCATIONS",
        locations: null
      });
    }

    const locations = await parser.getOutOfScopeLocations(
      source.toJS(),
      location
    );

    return dispatch({
      type: "OUT_OF_SCOPE_LOCATIONS",
      locations
    });
  };
}

export function clearPreview() {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (!currentSelection) {
      return;
    }

    return dispatch({
      type: "CLEAR_SELECTION"
    });
  };
}

function findBestMatch(symbols, tokenPos, token) {
  const { memberExpressions, identifiers } = symbols;
  const { line, column } = tokenPos;
  return identifiers.concat(memberExpressions).reduce((found, expression) => {
    const overlaps =
      expression.location.start.line == line &&
      expression.location.start.column <= column &&
      expression.location.end.column >= column;

    if (overlaps) {
      return expression;
    }

    return found;
  }, {});
}

export function setPreview(
  token: string,
  tokenPos: AstLocation,
  cursorPos: any
) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    await dispatch({
      type: "SET_PREVIEW",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());
        const _symbols = await parser.getSymbols(source.toJS());

        const found = findBestMatch(_symbols, tokenPos, token);
        if (!found) {
          return;
        }

        const { expression, location } = found;

        if (!expression) {
          return;
        }

        const selectedFrame = getSelectedFrame(getState());
        const { result } = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        if (!result) {
          return;
        }

        return {
          expression,
          result,
          location,
          tokenPos,
          cursorPos
        };
      })()
    });
  };
}
