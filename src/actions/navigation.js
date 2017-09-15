import { clearDocuments } from "../utils/editor";
import { getSources } from "../reducers/sources";
import { waitForMs } from "../utils/utils";
import { newSources } from "./sources";
import {
  clearASTs,
  clearSymbols,
  clearScopes,
  clearSources
} from "../utils/parser";
import { clearWasmStates } from "../utils/wasm";

/**
 * Redux actions for the navigation state
 * @module actions/navigation
 */

/**
 * @memberof actions/navigation
 * @static
 */
export function willNavigate(_, event) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    await sourceMaps.clearSourceMaps();
    clearWasmStates();
    clearDocuments();
    clearSymbols();
    clearASTs();
    clearScopes();
    clearSources();

    dispatch(navigate(event.url));
  };
}

export function navigate(url) {
  return {
    type: "NAVIGATE",
    url
  };
}

export function connect(url) {
  return {
    type: "CONNECT",
    url
  };
}

/**
 * @memberof actions/navigation
 * @static
 */
export function navigated() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    await waitForMs(100);
    if (getSources(getState()).size == 0) {
      const sources = await client.fetchSources();
      dispatch(newSources(sources));
    }
  };
}
