/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { isOriginalId } from "devtools-source-map";

import { setOutOfScopeLocations, setSymbols } from "../ast";
import { closeActiveSearch } from "../ui";
import { searchContents } from "../file-search";

import { togglePrettyPrint } from "./prettyPrint";
import { addTab, closeTab } from "./tabs";
import { loadSourceText } from "./loadSourceText";

import { prefs } from "../../utils/prefs";
import { shouldPrettyPrint, isMinified } from "../../utils/source";
import { createLocation } from "../../utils/location";
import { getGeneratedLocation } from "../../utils/source-maps";
import { getEditor } from "../../utils/editor";

import {
  getSource,
  getSourceByURL,
  getPrettySource,
  getActiveSearch,
  getSelectedLocation,
  getFileSearchQuery
} from "../../selectors";

import type { Location, Source } from "../../types";
import type { ThunkArgs } from "../types";

declare type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line: number, column?: ?number }
};

export const setSelectedLocation = (source: Source, location: Location) => ({
  type: "SET_SELECTED_LOCATION",
  source,
  location
});

export const setPendingSelectedLocation = (url: string, options: Object) => ({
  type: "SET_PENDING_SELECTED_LOCATION",
  url: url,
  line: options.location ? options.location.line : null
});

export const clearSelectedLocation = () => ({
  type: "CLEAR_SELECTED_LOCATION"
});

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
      const sourceId = source.id;
      const location = createLocation({ ...options.location, sourceId });
      await dispatch(selectLocation(location));
    } else {
      dispatch(setPendingSelectedLocation(url, options));
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSource(sourceId: string) {
  return async ({ dispatch }: ThunkArgs) => {
    const location = createLocation({ sourceId });
    return await dispatch(selectLocation(location));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectLocation(location: Location) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const previousLocation = getState().sources.selectedLocation;
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), location.sourceId);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch(clearSelectedLocation());
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    dispatch(addTab(source.url, 0));
    dispatch(setSelectedLocation(source, location));

    await dispatch(loadSourceText(source));
    const loadedSource = getSource(getState(), source.id);

    if (!loadedSource) {
      // If there was a navigation while we were loading the loadedSource
      return;
    }

    if (
      prefs.autoPrettyPrint &&
      !getPrettySource(getState(), loadedSource.id) &&
      shouldPrettyPrint(loadedSource) &&
      isMinified(loadedSource)
    ) {
      await dispatch(togglePrettyPrint(loadedSource.id));
      dispatch(closeTab(loadedSource.url));
    }

    dispatch(setSymbols(loadedSource.id));
    dispatch(setOutOfScopeLocations());

    // If this is a new location and there is an active file search open,
    // then update the results
    const isLocationChanged =
      !previousLocation || previousLocation.sourceId !== location.sourceId;
    if (isLocationChanged) {
      const isFileSearchOpen = getActiveSearch(getState()) === "file";
      const fileSearchQuery = getFileSearchQuery(getState());
      if (isFileSearchOpen && fileSearchQuery) {
        const editor = getEditor();
        dispatch(searchContents(fileSearchQuery, editor));
      }
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSpecificLocation(location: Location) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const previousLocation = getState().sources.selectedLocation;

    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), location.sourceId);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch(clearSelectedLocation());
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    dispatch(addTab(source.url, 0));
    dispatch(setSelectedLocation(source, location));

    await dispatch(loadSourceText(source));
    const loadedSource = getSource(getState(), source.id);
    if (!loadedSource) {
      return;
    }

    const sourceId = loadedSource.id;

    dispatch(setSymbols(sourceId));
    dispatch(setOutOfScopeLocations());

    // If this is a new location and there is an active file search open,
    // then update the results
    const isLocationChanged =
      !previousLocation || previousLocation.sourceId !== location.sourceId;
    if (isLocationChanged) {
      const isFileSearchOpen = getActiveSearch(getState()) === "file";
      const fileSearchQuery = getFileSearchQuery(getState());
      if (isFileSearchOpen && fileSearchQuery) {
        const editor = getEditor();
        dispatch(searchContents(fileSearchQuery, editor));
      }
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSpecificSource(sourceId: string) {
  return async ({ dispatch }: ThunkArgs) => {
    const location = createLocation({ sourceId });
    return await dispatch(selectSpecificLocation(location));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function jumpToMappedLocation(location: Location) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    if (!client) {
      return;
    }

    const source = getSource(getState(), location.sourceId);
    let pairedLocation;
    if (isOriginalId(location.sourceId)) {
      pairedLocation = await getGeneratedLocation(
        getState(),
        source,
        location,
        sourceMaps
      );
    } else {
      pairedLocation = await sourceMaps.getOriginalLocation(location, source);
    }

    return dispatch(selectLocation({ ...pairedLocation }));
  };
}

export function jumpToMappedSelectedLocation() {
  return async function({ dispatch, getState }: ThunkArgs) {
    const location = getSelectedLocation(getState());
    if (!location) {
      return;
    }

    await dispatch(jumpToMappedLocation(location));
  };
}
