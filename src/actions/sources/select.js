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
import { addTab } from "./tabs";
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
import type { ThunkArgs } from "../types";

declare type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line: number, column?: ?number },
  preserveOriginalSource?: boolean
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
export function selectLocation(
  location: Location,
  tabIndex: string = "",
  preserveOriginalSource: boolean = false
) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    console.log("------- selectLocation -------");

    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    let source = getSource(getState(), location.sourceId);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch({ type: "CLEAR_SELECTED_SOURCE" });
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    await dispatch(loadSourceText(source));

    // Since Source objects are immutable, we must re-fetch the source object
    // because `loadSourceText(source)` is changing the source object
    source = getSource(getState(), location.sourceId);

    const selectedSource = getSelectedSource(getState()) || source;
    if (!selectedSource) {
      return;
    }

    const sourceId = source.get("id");

    if (
      !preserveOriginalSource &&
      prefs.autoPrettyPrint &&
      // PROBLEM: Works the first time but not if we close the tab and re-open
      // !getPrettySource(getState(), sourceId) &&
      // /PROBLEM
      shouldPrettyPrint(source) &&
      isMinified(source)
    ) {
      console.log(
        "selectLocation: Opening prettyprint for: ",
        source.get("url")
      );

      await dispatch(togglePrettyPrint(sourceId));

      const newSource = getSelectedSource(getState());
      dispatch(addTab(newSource.toJS(), 0));
      console.log("selectLocation: Adding tab for ", newSource.get("url"));
    } else {
      console.log(
        "selectLocation: Opening original source for: ",
        source.get("url")
      );

      dispatch(addTab(source.toJS(), 0));
      console.log("selectLocation: Adding tab for ", source.get("url"));
      await dispatch({
        type: "SELECT_SOURCE",
        source: source.toJS(),
        tabIndex,
        location
      });
    }

    dispatch(setSymbols(sourceId));
    dispatch(setOutOfScopeLocations());
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

    return dispatch(selectLocation({ ...pairedLocation }, null, true));
  };
}

export function jumpToMappedSelectedLocation() {
  return async function({ dispatch, getState }: ThunkArgs) {
    const location = getSelectedLocation(getState());
    await dispatch(jumpToMappedLocation(location));
  };
}
