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
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    await sourceMaps.clearSourceMaps();
    clearDocuments();

    dispatch(navigate(event.url));
  };
}

export function navigate(url) {
  return {
    type: "NAVIGATE",
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
