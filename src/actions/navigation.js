import constants from "../constants";
import { clearSourceMaps } from "devtools-source-map";
import { clearDocuments } from "../utils/editor";
import { getSources } from "../reducers/sources";
import { waitForMs } from "../utils/utils";
import { newSources } from "./sources";

/**
 * Redux actions for the navigation state
 * @module actions/navigation
 */

/**
 * @memberof actions/navigation
 * @static
 */
export function willNavigate(_, event) {
  clearSourceMaps();
  clearDocuments();

  return {
    type: constants.NAVIGATE,
    url: event.url,
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
