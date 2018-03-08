/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */
import { toggleBlackBox } from "./blackbox";
import { syncBreakpoint } from "../breakpoints";
import { loadSourceText } from "./loadSourceText";
import { togglePrettyPrint } from "./prettyPrint";
import { selectLocation } from "../sources";
import { getRawSourceURL, isPrettyURL } from "../../utils/source";

import {
  getBlackBoxList,
  getSource,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource
} from "../../selectors";

import type { Source } from "../../types";
import type { ThunkArgs } from "../types";

function createOriginalSource(
  originalUrl,
  generatedSource,
  sourceMaps
): Source {
  return {
    url: originalUrl,
    id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
    isPrettyPrinted: false,
    isWasm: false,
    isBlackBoxed: false,
    loadedState: "unloaded"
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function loadSourceMap(generatedSource: Source) {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    let urls;
    try {
      urls = await sourceMaps.getOriginalURLs(generatedSource);
    } catch (e) {
      console.error(e);
      urls = null;
    }
    if (!urls) {
      // If this source doesn't have a sourcemap, enable it for pretty printing
      dispatch({
        type: "UPDATE_SOURCE",
        source: { ...generatedSource, sourceMapURL: "" }
      });
      return;
    }

    const originalSources = urls.map(url =>
      createOriginalSource(url, generatedSource, sourceMaps)
    );

    // TODO: check if this line is really needed, it introduces
    // a lot of lag to the application.
    const generatedSourceRecord = getSource(getState(), generatedSource.id);
    await dispatch(loadSourceText(generatedSourceRecord));
    dispatch(newSources(originalSources));
  };
}

// If a request has been made to show this source, go ahead and
// select it.
function checkSelectedSource(sourceId: string) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId).toJS();

    const pendingLocation = getPendingSelectedLocation(getState());

    if (!pendingLocation || !pendingLocation.url || !source.url) {
      return;
    }

    const pendingUrl = pendingLocation.url;
    const rawPendingUrl = getRawSourceURL(pendingUrl);

    if (rawPendingUrl === source.url) {
      if (isPrettyURL(pendingUrl)) {
        return await dispatch(togglePrettyPrint(source.id));
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
    const source = getSource(getState(), sourceId);

    const pendingBreakpoints = getPendingBreakpointsForSource(
      getState(),
      source.get("url")
    );

    if (!pendingBreakpoints.size) {
      return;
    }

    // load the source text if there is a pending breakpoint for it
    await dispatch(loadSourceText(source));

    const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
    for (const pendingBreakpoint of pendingBreakpointsArray) {
      await dispatch(syncBreakpoint(sourceId, pendingBreakpoint));
    }
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
      source => !getSource(getState(), source.id)
    );

    if (filteredSources.length == 0) {
      return;
    }

    dispatch({
      type: "ADD_SOURCES",
      sources: filteredSources
    });

    for (const source of filteredSources) {
      dispatch(checkSelectedSource(source.id));
      dispatch(checkPendingBreakpoints(source.id));
    }

    await Promise.all(
      filteredSources.map(source => dispatch(loadSourceMap(source)))
    );
    // We would like to restore the blackboxed state
    // after loading all states to make sure the correctness.
    dispatch(restoreBlackBoxedSources(filteredSources));
  };
}
