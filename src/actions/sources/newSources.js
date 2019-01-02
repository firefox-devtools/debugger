/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { generatedToOriginalId } from "devtools-source-map";
import { flatten } from "lodash";

import { toggleBlackBox } from "./blackbox";
import { syncBreakpoint } from "../breakpoints";
import { loadSourceText } from "./loadSourceText";
import { togglePrettyPrint } from "./prettyPrint";
import { selectLocation } from "../sources";
import { getRawSourceURL, isPrettyURL, isOriginal } from "../../utils/source";
import {
  getBlackBoxList,
  getSource,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource
} from "../../selectors";

import { prefs } from "../../utils/prefs";
import sourceQueue from "../../utils/source-queue";

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
    id: generatedToOriginalId(generatedSource.id, originalUrl),
    thread: generatedSource.thread,
    isPrettyPrinted: false,
    isWasm: false,
    isBlackBoxed: false,
    loadedState: "unloaded"
  };
}

function loadSourceMaps(sources: Source[]) {
  return async function({
    dispatch,
    sourceMaps
  }: ThunkArgs): Promise<Promise<Source>[]> {
    if (!prefs.clientSourceMapsEnabled) {
      return [];
    }

    const sourceList = await Promise.all(
      sources.map(async ({ id }) => {
        const originalSources = await dispatch(loadSourceMap(id));
        sourceQueue.queueSources(originalSources);
        return originalSources;
      })
    );

    await sourceQueue.flush();
    return flatten(sourceList);
  };
}

/**
 * @memberof actions/sources
 * @static
 */
function loadSourceMap(sourceId: SourceId) {
  return async function({
    dispatch,
    getState,
    sourceMaps
  }: ThunkArgs): Promise<Source[]> {
    const source = getSource(getState(), sourceId);

    if (!source || isOriginal(source) || !source.sourceMapURL) {
      return [];
    }

    let urls = null;
    try {
      urls = await sourceMaps.getOriginalURLs(source);
    } catch (e) {
      console.error(e);
    }

    if (!urls) {
      // The source might have changed while we looked up the URLs, so we need
      // to load it again before dispatching. We ran into an issue here because
      // this was previously using 'source' and was at risk of resetting the
      // 'loadedState' field to 'loading', putting it in an inconsistent state.
      const currentSource = getSource(getState(), sourceId);

      // If this source doesn't have a sourcemap, enable it for pretty printing
      dispatch(
        ({
          type: "UPDATE_SOURCE",
          // NOTE: Flow https://github.com/facebook/flow/issues/6342 issue
          source: (({ ...currentSource, sourceMapURL: "" }: any): Source)
        }: Action)
      );
      return [];
    }

    return urls.map(url => createOriginalSource(url, source, sourceMaps));
  };
}

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(sourceId: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    const pendingLocation = getPendingSelectedLocation(getState());

    if (!pendingLocation || !pendingLocation.url || !source || !source.url) {
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
        selectLocation({
          sourceId: source.id,
          line:
            typeof pendingLocation.line === "number" ? pendingLocation.line : 0,
          column: pendingLocation.column
        })
      );
    }
  };
}

function checkPendingBreakpoints(sourceId: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    // source may have been modified by selectLocation
    const source = getSource(getState(), sourceId);
    if (!source) {
      return;
    }

    const pendingBreakpoints = getPendingBreakpointsForSource(
      getState(),
      source
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
    sources = sources.filter(source => !getSource(getState(), source.id));

    if (sources.length == 0) {
      return;
    }

    dispatch(({ type: "ADD_SOURCES", sources: sources }: Action));

    for (const source of sources) {
      dispatch(checkSelectedSource(source.id));
    }

    // We would like to restore the blackboxed state
    // after loading all states to make sure the correctness.
    dispatch(restoreBlackBoxedSources(sources));

    dispatch(loadSourceMaps(sources)).then(() => {
      // We would like to sync breakpoints after we are done
      // loading source maps as sometimes generated and original
      // files share the same paths.
      for (const source of sources) {
        dispatch(checkPendingBreakpoints(source.id));
      }
    });
  };
}
