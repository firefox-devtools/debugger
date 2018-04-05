// @flow

import { getSymbols, getSource, getSelectedFrame } from "../../selectors";
import { fetchExtra } from "./fetchExtra";

import type { ThunkArgs } from "../types";

export function setExtra() {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    const source = getSource(getState(), frame.location.sourceId);
    const symbols = getSymbols(getState(), source);

    if (symbols && symbols.classes) {
      dispatch(fetchExtra());
    }
  };
}
