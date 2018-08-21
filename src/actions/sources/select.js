/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { isOriginalId } from "devtools-source-map";

import { getSourceFromId } from "../../reducers/sources";
import { setOutOfScopeLocations, setSymbols } from "../ast";
import { closeActiveSearch, updateActiveFileSearch } from "../ui";

import { togglePrettyPrint } from "./prettyPrint";
import { addTab, closeTab } from "../tabs";
import { loadSourceText } from "./loadSourceText";

import { prefs } from "../../utils/prefs";
import { shouldPrettyPrint, isMinified } from "../../utils/source";
import { createLocation } from "../../utils/location";
import { getMappedLocation } from "../../utils/source-maps";

import {
  getSource,
  getSourceByURL,
  getPrettySource,
  getActiveSearch,
  getSelectedLocation,
  getSelectedSource
} from "../../selectors";

import type { Location, Position, Source } from "../../types";
import type { ThunkArgs } from "../types";

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
 * yet.
 *
 * This exists mostly for external things to interact with the
 * debugger.
 *
 * @memberof actions/sources
 * @static
 */

export function selectSourceURL(url: string, options: Position = { line: 1 }) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    const source = getSourceByURL(getState(), url);
    if (!source) {
      return dispatch(setPendingSelectedLocation(url, options));
    }

    const sourceId = source.id;
    const location = createLocation({ ...options, sourceId });
    return dispatch(selectLocation(location));
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
export function selectLocation(
  location: Location,
  { keepContext = true }: Object = {}
) {
  return async ({ dispatch, getState, sourceMaps, client }: ThunkArgs) => {
    const currentSource = getSelectedSource(getState());

    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    let source = getSource(getState(), location.sourceId);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch(clearSelectedLocation());
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    // Preserve the current source map context (original / generated)
    // when navigting to a new location.
    const selectedSource = getSelectedSource(getState());
    if (
      keepContext &&
      selectedSource &&
      isOriginalId(selectedSource.id) != isOriginalId(location.sourceId)
    ) {
      location = await getMappedLocation(getState(), sourceMaps, location);
      source = getSourceFromId(getState(), location.sourceId);
    }

    dispatch(addTab(source.url));

    dispatch(setSelectedLocation(source, location));

    await dispatch(loadSourceText(source));
    const loadedSource = getSource(getState(), source.id);

    if (!loadedSource) {
      // If there was a navigation while we were loading the loadedSource
      return;
    }

    if (
      keepContext &&
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

    // If a new source is selected update the file search results
    const newSource = getSelectedSource(getState());
    if (currentSource && currentSource !== newSource) {
      dispatch(updateActiveFileSearch());
    }
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSpecificLocation(location: Location) {
  return selectLocation(location, { keepContext: false });
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

    const pairedLocation = await getMappedLocation(
      getState(),
      sourceMaps,
      location
    );

    return dispatch(selectSpecificLocation({ ...pairedLocation }));
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
