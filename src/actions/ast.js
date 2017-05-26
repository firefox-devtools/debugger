import { getSourceText, hasSymbols } from "../selectors";
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
