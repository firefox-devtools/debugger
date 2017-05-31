import {
  getSourceText,
  hasSymbols,
  getSelectedLocation,
  getSelectedSourceText,
  getSelectedFrame,
  getSelection
} from "../selectors";
import { PROMISE } from "../utils/redux/middleware/promise";
import parser from "../utils/parser";

export function setSymbols(source) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    if (hasSymbols(getState(), source)) {
      return;
    }

    const sourceText = getSourceText(getState(), source.id);
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

    if (!location.line) {
      return dispatch({
        type: "OUT_OF_SCOPE_LOCATIONS",
        locations: null
      });
    }

    const sourceText = getSourceText(getState(), location.sourceId);
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

export function setSelection(token, position) {
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
        const { expression, location } = await parser.getClosestExpression(
          sourceText.toJS(),
          token,
          position
        );

        if (!expression) {
          return;
        }

        const value = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        const result = value.result;

        return {
          expression,
          result,
          location
        };
      })()
    });
  };
}
