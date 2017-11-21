/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "../utils/middleware/promise";
import assert from "../../utils/assert";
import { remapBreakpoints } from "../breakpoints";
import { throttle } from "lodash";
import { setEmptyLines, setOutOfScopeLocations } from "../ast";
import { syncBreakpoint } from "../breakpoints";
import { searchSource } from "../project-text-search";
import { closeActiveSearch } from "../ui";

import { getPrettySourceURL, isLoaded } from "../../utils/source";
import { createPrettySource } from "../sources/createPrettySource";
import { loadSourceText } from "../sources/loadSourceText";

import { prefs } from "../../utils/prefs";
import { removeDocument } from "../../utils/editor";
import {
  isThirdParty,
  isMinified,
  shouldPrettyPrint
} from "../../utils/source";
import { getGeneratedLocation } from "../../utils/source-maps";
import { isOriginalId } from "devtools-source-map";
import {
  getSource,
  getSources,
  getSourceByURL,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource,
  getSourceTabs,
  getNewSelectedSourceId,
  getSelectedLocation,
  removeSourcesFromTabList,
  removeSourceFromTabList,
  getTextSearchQuery,
  getActiveSearch,
  getGeneratedSource
} from "../../selectors";

import type { Source } from "../../types";
import type { ThunkArgs } from "../types";
import type { State } from "../../reducers/types";

export type SelectSourceOptions = {
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
      await dispatch(selectSource(source.get("id"), options));
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
export function selectSource(id: string, options: SelectSourceOptions = {}) {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    if (!client) {
      // No connection, do nothing. This happens when the debugger is
      // shut down too fast and it tries to display a default source.
      return;
    }

    const source = getSource(getState(), id);
    if (!source) {
      // If there is no source we deselect the current selected source
      return dispatch({ type: "CLEAR_SELECTED_SOURCE" });
    }

    const activeSearch = getActiveSearch(getState());
    if (activeSearch !== "file") {
      dispatch(closeActiveSearch());
    }

    return dispatch({
      type: "SELECT_SOURCE",
      source: source.toJS(),
      tabIndex: options.tabIndex,
      location: options.location || {},
      [PROMISE]: (async () => {
        await dispatch(loadSourceText(source.toJS()));
        await dispatch(setOutOfScopeLocations());
        const src = getSource(getState(), id).toJS();
        if (shouldPrettyPrint(src) && isMinified(src.id, src.text)) {
          await dispatch(togglePrettyPrint(src.id));
        }
      })()
    });
  };
}

/**
 * Toggle the pretty printing of a source's text. All subsequent calls to
 * |getText| will return the pretty-toggled text. Nothing will happen for
 * non-javascript files.
 *
 * @memberof actions/sources
 * @static
 * @param string id The source form from the RDP.
 * @returns Promise
 *          A promise that resolves to [aSource, prettyText] or rejects to
 *          [aSource, error].
 */
export function togglePrettyPrint(sourceId: string) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const source = getSource(getState(), sourceId).toJS();

    if (!source || !isLoaded(source)) {
      return {};
    }

    assert(
      sourceMaps.isGeneratedId(sourceId),
      "Pretty-printing only allowed on generated sources"
    );

    const selectedLocation = getSelectedLocation(getState());
    const url = getPrettySourceURL(source.url);
    const prettySource = getSourceByURL(getState(), url);

    const options = {};
    if (selectedLocation) {
      options.location = await sourceMaps.getOriginalLocation(selectedLocation);
    }

    if (prettySource) {
      return dispatch(selectSource(prettySource.get("id"), options));
    }

    const newPrettySource = await dispatch(createPrettySource(sourceId));
    await dispatch(remapBreakpoints(sourceId));
    await dispatch(setEmptyLines(newPrettySource.id));
    return dispatch(selectSource(newPrettySource.id, options));
  };
}
