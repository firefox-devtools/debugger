/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { isGeneratedId } from "devtools-source-map";
import { flatten } from "lodash";

import { toggleBlackBox } from "./blackbox";
import { syncBreakpoint } from "../breakpoints";
import { loadSourceText } from "./loadSourceText";
import { togglePrettyPrint } from "./prettyPrint";
import { selectLocation } from "../sources";
import { getRawSourceURL, isPrettyURL } from "../../utils/source";
import {
  getBlackBoxList,
  getSource,
  getSourceFromId,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource
} from "../../selectors";

import type { Source, SourceId } from "../../types";
import type { Action, ThunkArgs } from "../types";

function createOriginalSource(
  originalUrl,
  generatedSource,
  sourceMaps
): Source {
  return {
    url: originalUrl,
    relativeUrl: originalUrl,
    id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
    isPrettyPrinted: false,
    isWasm: false,
    isBlackBoxed: false,
    loadedState: "unloaded"
  };
}

function loadSourceMaps(sources) {
  return async function({ dispatch, sourceMaps }: ThunkArgs) {
    if (!sourceMaps) {
      return;
    }

    const originalSources = await Promise.all(
      sources.map(source => dispatch(loadSourceMap(source.id)))
    );

    await dispatch(newSources(flatten(originalSources)));
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(sourceId: SourceId) {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const source = getSource(getState(), sourceId);

    if (!source || !isGeneratedId(sourceId) || !source.sourceMapURL) {
      return;
    }

    let urls = null;
    try {
      urls = await sourceMaps.getOriginalURLs(source);
    } catch (e) {
      console.error(e);
    }

    if (!urls) {
      // If this source doesn't have a sourcemap, enable it for pretty printing
      dispatch(
        ({
          type: "UPDATE_SOURCE",
          source: { ...source, sourceMapURL: "" }
        }: Action)
      );
      return;
    }

    return urls.map(url => createOriginalSource(url, source, sourceMaps));
  };
}

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(sourceId: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSourceFromId(getState(), sourceId);

    const pendingLocation = getPendingSelectedLocation(getState());

    if (!pendingLocation || !pendingLocation.url || !source.url) {
      return;
    }

    const pendingUrl = pendingLocation.url;
    const rawPendingUrl = getRawSourceURL(pendingUrl);

    if (rawPendingUrl === source.url) {
      if (isPrettyURL(pendingUrl)) {
        const prettySource = await dispatch(togglePrettyPrint(source.id));
        return dispatch(checkPendingBreakpoints(prettySource.id));
      }

      await dispatch(
        selectLocation({ ...pendingLocation, sourceId: source.id })
      );
    }
  };
}

function checkPendingBreakpoints(sourceId: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    // source may have been modified by selectLocation
    const source = getSourceFromId(getState(), sourceId);

    const pendingBreakpoints = getPendingBreakpointsForSource(
      getState(),
      source.url
    );

    if (pendingBreakpoints.length === 0) {
      return;
    }

    // load the source text if there is a pending breakpoint for it
    await dispatch(loadSourceText(source));

    await Promise.all(
      pendingBreakpoints.map(bp => dispatch(syncBreakpoint(sourceId, bp)))
    );
  };
}

function restoreBlackBoxedSources(sources: Source[]) {
  return async ({ dispatch }: ThunkArgs) => {
    const tabs = getBlackBoxList();
    if (tabs.length == 0) {
      return;
    }
    for (const source of sources) {
      if (tabs.includes(source.url) && !source.isBlackBoxed) {
        dispatch(toggleBlackBox(source));
      }
    }
  };
}

/**
 * Handler for the debugger client's unsolicited newSource notification.
 * @memberof actions/sources
 * @static
 */
export function newSource(source: Source) {
  return async ({ dispatch }: ThunkArgs) => {
    await dispatch(newSources([source]));
  };
}

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => source && !getSource(getState(), source.id)
    );

    if (filteredSources.length == 0) {
      return;
    }

    dispatch(
      ({
        type: "ADD_SOURCES",
        sources: filteredSources
      }: Action)
    );

    for (const source of filteredSources) {
      dispatch(checkSelectedSource(source.id));
      dispatch(checkPendingBreakpoints(source.id));
    }

    await dispatch(loadSourceMaps(filteredSources));

    // We would like to restore the blackboxed state
    // after loading all states to make sure the correctness.
    await dispatch(restoreBlackBoxedSources(filteredSources));
  };
}
