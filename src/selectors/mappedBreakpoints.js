/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { makeLocationId } from "../utils/breakpoint";

import I from "immutable";

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
  const condition = breakpoint.condition;
  const locationId = makeLocationId(location);
  const source = getSourceInSources(sources, location.sourceId);

  if (isGeneratedId(selectedSource.id)) {
    location = breakpoint.generatedLocation || breakpoint.location;
    text = breakpoint.text;
  }
  const localBP = { locationId, location, text, source, condition };

  return localBP;
}

function _getMappedBreakpoints(breakpoints, sources, selectedSource) {
  if (!selectedSource) {
    return I.Map();
  }
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
