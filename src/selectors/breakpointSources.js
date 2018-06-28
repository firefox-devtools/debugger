/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { sortBy, uniq } from "lodash";
import { createSelector } from "reselect";
import { getSources, getBreakpoints } from "../selectors";
import { getFilename } from "../utils/source";

import type { Source, Breakpoint } from "../types";
import type { SourcesMap, BreakpointsMap } from "../reducers/types";

export type BreakpointSources = Array<{
  source: Source,
  breakpoints: Breakpoint[]
}>;

function getBreakpointsForSource(
  source: Source,
  breakpoints: BreakpointsMap
): Breakpoint[] {
  const bpList = breakpoints.valueSeq();

  return bpList
    .filter(
      bp =>
        bp.location.sourceId == source.id &&
        !bp.hidden &&
        (bp.text || bp.condition)
    )
    .sortBy(bp => bp.location.line)
    .toJS();
}

function findBreakpointSources(
  sources: SourcesMap,
  breakpoints: BreakpointsMap
): Source[] {
  const sourceIds: string[] = uniq(
    breakpoints
      .valueSeq()
      .filter(bp => !bp.hidden)
      .map(bp => bp.location.sourceId)
      .toJS()
  );

  const breakpointSources = sourceIds
    .map(id => sources[id])
    .filter(source => source && !source.isBlackBoxed);

  return sortBy(breakpointSources, (source: Source) => getFilename(source));
}

function _getBreakpointSources(
  breakpoints: BreakpointsMap,
  sources: SourcesMap
): BreakpointSources {
  const breakpointSources = findBreakpointSources(sources, breakpoints);
  return breakpointSources.map(source => ({
    source,
    breakpoints: getBreakpointsForSource(source, breakpoints)
  }));
}

export const getBreakpointSources = createSelector(
  getBreakpoints,
  getSources,
  _getBreakpointSources
);
