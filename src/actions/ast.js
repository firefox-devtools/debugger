import { getSelectedLocation, getSourceText, hasSymbols } from "../selectors";
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
