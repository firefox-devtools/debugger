// @flow

import {
  getSourceText,
  hasSymbols,
  getSelectedLocation,
  getSelectedSourceText,
  getSelectedFrame,
  getSelection
} from "../selectors";

import { PROMISE } from "../utils/redux/middleware/promise";
import * as parser from "../utils/parser";

import type { Source } from "debugger-html";
import type { ThunkArgs } from "./types";
import type { AstLocation } from "../utils/parser";

export function setSymbols(source: Source) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (hasSymbols(getState(), source)) {
      return;
    }

    const sourceText = getSourceText(getState(), source.id);
    if (!sourceText) {
      return;
    }

    const symbols = await parser.getSymbols(sourceText.toJS());

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
    const sourceText = getSourceText(getState(), location.sourceId);

    if (!location.line || !sourceText) {
      return dispatch({
        type: "OUT_OF_SCOPE_LOCATIONS",
        locations: null
      });
    }

    const locations = await parser.getOutOfScopeLocations(
      sourceText.toJS(),
      location
    );

    return dispatch({
      type: "OUT_OF_SCOPE_LOCATIONS",
      locations
    });
  };
}

export function clearSelection() {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getSelection(getState());
    if (!currentSelection) {
      return;
    }

    return dispatch({
      type: "CLEAR_SELECTION"
    });
  };
}

export function setSelection(token: string, position: AstLocation) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getSelection(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    const sourceText = getSelectedSourceText(getState());
    const selectedFrame = getSelectedFrame(getState());

    await dispatch({
      type: "SET_SELECTION",
      [PROMISE]: (async function() {
        const closestExpression = await parser.getClosestExpression(
          sourceText.toJS(),
          token,
          position
        );

        if (!closestExpression) {
          return;
        }

        const { expression, location } = closestExpression;

        if (!expression) {
          return;
        }

        const { result } = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        return {
          expression,
          result,
          location
        };
      })()
    });
  };
}
