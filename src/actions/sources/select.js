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

import { togglePrettyPrint } from "./prettyPrint";
import { addTab, closeTab } from "./tabs";
import { loadSourceText } from "./loadSourceText";

import { prefs } from "../../utils/prefs";
import { shouldPrettyPrint, isMinified } from "../../utils/source";
import { createLocation } from "../../utils/location";
import { getGeneratedLocation } from "../../utils/source-maps";

import {
  getSource,
  getSourceByURL,
  getSelectedSource,
  getPrettySource,
  getActiveSearch,
  getSelectedLocation
} from "../../selectors";

import type { Location } from "../../types";
import type { Action, ThunkArgs } from "../types";

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
      const sourceId = source.id;
      const location = createLocation({ ...options.location, sourceId });
      // flow is unable to comprehend that if an options.location object
      // exists, that we have a valid Location object, and if it doesnt,
      // we have a valid { sourceId: string } object. So we are overriding
      // the error
      // $FlowIgnore
      await dispatch(selectLocation(location, options.tabIndex));
    } else {
      dispatch(
        ({
          type: "SELECT_SOURCE_URL",
          url: url,
          line: options.location ? options.location.line : null
        }: Action)
      );
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
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const sourceRecord = getSource(getState(), location.sourceId);
    if (!sourceRecord) {
      // If there is no source we deselect the current selected source
      return dispatch(({ type: "CLEAR_SELECTED_SOURCE" }: Action));
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    const source = sourceRecord.toJS();

    dispatch(addTab(source, 0));
    dispatch(
      ({
        type: "SELECT_SOURCE",
        source,
        location
      }: Action)
    );

    await dispatch(loadSourceText(sourceRecord));
    const selectedSource = getSelectedSource(getState());
    if (!selectedSource) {
      return;
    }

    const sourceId = selectedSource.id;

    if (
      prefs.autoPrettyPrint &&
      !getPrettySource(getState(), sourceId) &&
      shouldPrettyPrint(selectedSource) &&
      isMinified(selectedSource)
    ) {
      await dispatch(togglePrettyPrint(sourceId));
      dispatch(closeTab(source.url));
    }

    dispatch(setSymbols(sourceId));
    dispatch(setOutOfScopeLocations());
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function selectSpecificLocation(location: Location) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const sourceRecord = getSource(getState(), location.sourceId);
    if (!sourceRecord) {
      // If there is no source we deselect the current selected source
      return dispatch(({ type: "CLEAR_SELECTED_SOURCE" }: Action));
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    const source = sourceRecord.toJS();

    dispatch(addTab(source, 0));
    dispatch(
      ({
        type: "SELECT_SOURCE",
        source,
        location
      }: Action)
    );

    await dispatch(loadSourceText(sourceRecord));
    const selectedSource = getSelectedSource(getState());
    if (!selectedSource) {
      return;
    }

    const sourceId = selectedSource.id;
    dispatch(setSymbols(sourceId));
    dispatch(setOutOfScopeLocations());
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
        source.toJS(),
        location,
        sourceMaps
      );
    } else {
      pairedLocation = await sourceMaps.getOriginalLocation(
        location,
        source.toJS()
      );
    }

    return dispatch(selectLocation({ ...pairedLocation }));
  };
}

export function jumpToMappedSelectedLocation() {
  return async function({ dispatch, getState }: ThunkArgs) {
    const location = getSelectedLocation(getState());
    await dispatch(jumpToMappedLocation(location));
  };
}
