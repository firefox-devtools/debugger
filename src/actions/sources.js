/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { setOutOfScopeLocations } from "./ast";
import { searchSource } from "./project-text-search";
import { closeActiveSearch } from "./ui";

import { createLocation } from "../utils/location";
import { togglePrettyPrint } from "./sources/prettyPrint";
import { addTab, closeTab } from "./sources/tabs";
import { loadSourceText } from "./sources/loadSourceText";

import { prefs } from "../utils/prefs";
import { isThirdParty, shouldPrettyPrint, isMinified } from "../utils/source";
import { getGeneratedLocation } from "../utils/source-maps";
import { isOriginalId } from "devtools-source-map";

import {
  getSource,
  getSources,
  getSourceByURL,
  getSelectedSource,
  getPrettySource,
  getTextSearchQuery,
  getActiveSearch
} from "../selectors";

import type { Location } from "../types";
import type { ThunkArgs } from "./types";

declare type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line: number, column?: ?number }
};

/**
 * Deterministically select a source that has a given URL. This will
 * work regardless of the connection status or if the source exists
 * yet. This exists mostly for external things to interact with the
 * debugger.
 *
 * @memberof actions/sources
 * @static
 */
export function selectSourceURL(
  url: string,
  options: SelectSourceOptions = {}
) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSourceByURL(getState(), url);
    if (source) {
      const sourceId = source.get("id");
      const location = createLocation({ ...options.location, sourceId });
      // flow is unable to comprehend that if an options.location object
      // exists, that we have a valid Location object, and if it doesnt,
      // we have a valid { sourceId: string } object. So we are overriding
      // the error
      // $FlowIgnore
      await dispatch(selectLocation(location, options.tabIndex));
    } else {
      dispatch({
        type: "SELECT_SOURCE_URL",
        url: url,
        tabIndex: options.tabIndex,
        location: options.location
      });
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSource(sourceId: string, tabIndex: string = "") {
  return async ({ dispatch }: ThunkArgs) => {
    const location = createLocation({ sourceId });
    return await dispatch(selectLocation(location, tabIndex));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectLocation(location: Location, tabIndex: string = "") {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), location.sourceId);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch({ type: "CLEAR_SELECTED_SOURCE" });
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    dispatch(addTab(source.toJS(), 0));

    dispatch({
      type: "SELECT_SOURCE",
      source: source.toJS(),
      tabIndex,
      location
    });

    await dispatch(loadSourceText(source));
    const selectedSource = getSelectedSource(getState());
    if (
      prefs.autoPrettyPrint &&
      !getPrettySource(getState(), selectedSource.get("id")) &&
      shouldPrettyPrint(selectedSource) &&
      isMinified(selectedSource)
    ) {
      await dispatch(togglePrettyPrint(source.get("id")));
      dispatch(closeTab(source.get("url")));
    }

    dispatch(setOutOfScopeLocations());
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function jumpToMappedLocation(sourceLocation: any) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    if (!client) {
      return;
    }

    const source = getSource(getState(), sourceLocation.sourceId);
    let pairedLocation;
    if (isOriginalId(sourceLocation.sourceId)) {
      pairedLocation = await getGeneratedLocation(
        getState(),
        source.toJS(),
        sourceLocation,
        sourceMaps
      );
    } else {
      pairedLocation = await sourceMaps.getOriginalLocation(
        sourceLocation,
        source.toJS()
      );
    }

    return dispatch(selectLocation({ ...pairedLocation }));
  };
}

/**
  Load the text for all the available sources
 * @memberof actions/sources
 * @static
 */
export function loadAllSources() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sources = getSources(getState());
    const query = getTextSearchQuery(getState());
    for (const [, source] of sources) {
      if (isThirdParty(source)) {
        continue;
      }

      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source.get("id"), query));
      }
    }
  };
}
