// @flow

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
import { loadSourceText } from "./loadSourceText";
import { selectSource } from "./selectSource";

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

function createSource(originalUrl, generatedSource, sourceMaps): Source {
  return {
    url: originalUrl,
    id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
    isPrettyPrinted: false,
    isWasm: false,
    isBlackBoxed: false,
    loadedState: "unloaded"
  };
}

// If a request has been made to show this source, go ahead and
// select it.
async function checkSelectedSource(state: State, dispatch, source) {
  const pendingLocation = getPendingSelectedLocation(state);

  if (pendingLocation && !!source.url && pendingLocation.url === source.url) {
    await dispatch(selectSource(source.id, { location: pendingLocation }));
  }
}

async function checkPendingBreakpoints(state, dispatch, sourceId) {
  // source may have been modified by selectSource
  let source = getSource(state, sourceId).toJS();

  const pendingBreakpoints = getPendingBreakpointsForSource(state, source.url);
  if (!pendingBreakpoints.size) {
    return;
  }

  // load the source text if there is a pending breakpoint for it
  await dispatch(loadSourceText(source));

  if (isOriginalId(source.id)) {
    const generatedSource = getGeneratedSource(state, source);
    await dispatch(loadSourceText(source.toJS()));
  }

  const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
  for (const pendingBreakpoint of pendingBreakpointsArray) {
    await dispatch(syncBreakpoint(sourceId, pendingBreakpoint));
  }
}

async function loadSourceMap(
  generatedSource: Source,
  sourceMaps
): Promise<Source[]> {
  const urls: Array<any> = await sourceMaps.getOriginalURLs(generatedSource);

  if (!urls) {
    return [];
  }

  return urls.map(originalUrl =>
    createSource(originalUrl, generatedSource, sourceMaps)
  );
}

async function loadOriginalSources(sources: Source[], sourceMaps) {
  return sources.reduce(
    async (originalSources, source) => [
      ...originalSources,
      ...(await loadSourceMap(source, sourceMaps))
    ],
    []
  );
}

export function newSource(source: Source) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    await dispatch(newSources([source]));
  };
}

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => !getSource(getState(), source.id)
    );

    // 1. add sources to the redux store
    dispatch({ type: "ADD_SOURCES", sources });

    // 2. check for a selected source and start loading it
    for (const source of filteredSources) {
      checkSelectedSource(getState(), dispatch, source);
    }

    // 3. loads all of the original sources and adds them to the store
    const originalSources = await loadOriginalSources(
      filteredSources,
      sourceMaps
    );

    dispatch({ type: "ADD_SOURCES", sources: originalSources });

    // 4. check for a selected source and start loading it
    for (const source of originalSources) {
      checkSelectedSource(getState(), dispatch, source);
    }

    // 5. check for pending breakpoints and syncs them.
    // NOTE: it would be nice to make this smarter so that
    // we first show un-adjusted breakpoints and then we adjust the locations.
    const allSources = filteredSources.concat(originalSources);

    for (const source of allSources) {
      checkPendingBreakpoints(getState(), dispatch, source.id);
    }
  };
}
