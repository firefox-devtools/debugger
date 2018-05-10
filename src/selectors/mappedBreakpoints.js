import { makeLocationId } from "../utils/breakpoint";

import {
  getSources,
  getSourceInSources,
  getBreakpoints,
  getPauseReason,
  getSelectedSource,
  getTopFrame
} from "../selectors";

import { isGeneratedId } from "devtools-source-map";

import { createSelector } from "reselect";

function formatBreakpoint(
  sources,
  selectedSource,
  breakpoint
): LocalBreakpoint {
  let location = breakpoint.location;
  let text = breakpoint.originalText;
  const locationId = makeLocationId(location);
  const source = getSourceInSources(sources, location.sourceId);

  if (isGeneratedId(selectedSource.id)) {
    location = breakpoint.generatedLocation || breakpoint.location;
    text = breakpoint.text;
  }
  const localBP = { locationId, location, text, source };

  return localBP;
}

function _getMappedBreakpoints(breakpoints, sources, selectedSource) {
  return breakpoints
    .map(bp => formatBreakpoint(sources, selectedSource, bp))
    .filter(bp => bp.source && !bp.source.isBlackBoxed);
}

export const getMappedBreakpoints = createSelector(
  getBreakpoints,
  getSources,
  getSelectedSource,
  getTopFrame,
  getPauseReason,
  _getMappedBreakpoints
);
