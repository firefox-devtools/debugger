// @flow

import {
  getSource,
  hasSymbols,
  getSelectedLocation,
  getSelectedSource,
  getSelectedFrame,
  getPreview
} from "../selectors";

import { ensureParserHasSourceText } from "./sources";
import { getMappedExpression } from "./expressions";
import { PROMISE } from "../utils/redux/middleware/promise";
import {
  getSymbols,
  getEmptyLines,
  getOutOfScopeLocations
} from "../workers/parser";

import { isGeneratedId } from "devtools-source-map";

import type { SourceId } from "debugger-html";
import type { ThunkArgs } from "./types";
import type { AstLocation } from "../workers/parser";

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

    const symbols = await getSymbols(source);

    dispatch({
      type: "SET_SYMBOLS",
      source,
      symbols
    });
  };
}

export function setEmptyLines(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (!sourceRecord) {
      return;
    }

    const source = sourceRecord.toJS();
    if (!source.text) {
      return;
    }

    const emptyLines = await getEmptyLines(source);

    dispatch({
      type: "SET_EMPTY_LINES",
      source,
      emptyLines
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

    const locations = await getOutOfScopeLocations(source.toJS(), location);

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
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    await dispatch({
      type: "SET_PREVIEW",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());
        const _symbols = await getSymbols(source.toJS());

        const found = findBestMatch(_symbols, tokenPos, token);
        if (!found) {
          return;
        }

        let { expression, location } = found;

        if (!expression) {
          return;
        }

        const sourceId = source.get("id");
        if (location && !isGeneratedId(sourceId)) {
          const generatedLocation = await sourceMaps.getGeneratedLocation(
            { ...location.start, sourceId },
            source.toJS()
          );

          const generatedSourceId = generatedLocation.sourceId;
          await dispatch(ensureParserHasSourceText(generatedSourceId));

          expression = await getMappedExpression(
            { sourceMaps },
            generatedLocation,
            expression
          );
        }

        const selectedFrame = getSelectedFrame(getState());
        const { result } = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        if (result === undefined) {
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
