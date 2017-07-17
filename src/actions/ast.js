// @flow

import {
  getSource,
  hasSymbols,
  getSelectedLocation,
  getSelectedSource,
  getSelectedFrame,
  getSelection
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

function findBestMatch(symbols, tokenPos, token) {
  const { memberExpressions, identifiers } = symbols;
  const { line, column } = tokenPos;
  return memberExpressions.concat(identifiers).reduce((found, expression) => {
    const isNear =
      expression.location.start.line == line &&
      expression.location.start.column <= column &&
      expression.location.end.column >= column;

    const isCloser =
      expression.location.start.line == line &&
      expression.location.start.column <= column &&
      expression.location.end.column >= column;

    const thisExpression = new RegExp(`this.${token}$`);
    const previousContainsThis = thisExpression.test(found.expression);

    if (isNear && isCloser && !previousContainsThis) {
      return expression;
    }

    return found;
  }, {});
}

export function setSelection(
  token: string,
  tokenPos: AstLocation,
  cursorPos: any
) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getSelection(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    await dispatch({
      type: "SET_SELECTION",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());
        const _symbols = await parser.getSymbols(source.toJS());

        const found = findBestMatch(_symbols, tokenPos, token);

        if (!found) {
          return;
        }

        const { expression, location } = found;

        console.log(found, expression);
        if (!expression) {
          return;
        }

        const selectedFrame = getSelectedFrame(getState());
        const foo = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        const { result } = foo;

        console.log(result)
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
