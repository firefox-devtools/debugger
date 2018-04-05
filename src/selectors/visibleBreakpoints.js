/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getBreakpoints } from "../reducers/breakpoints";
import { getSelectedSource } from "../reducers/sources";
import { isGeneratedId } from "devtools-source-map";

import type { State } from "../reducers/types";

function getLocation(breakpoint, isGeneratedSource) {
  return isGeneratedSource
    ? breakpoint.generatedLocation || breakpoint.location
    : breakpoint.location;
}

function formatBreakpoint(breakpoint, selectedSource) {
  const { condition, loading, disabled, hidden } = breakpoint;
  const sourceId = selectedSource.get("id");
  const isGeneratedSource = isGeneratedId(sourceId);

  return {
    location: getLocation(breakpoint, isGeneratedSource),
    condition,
    loading,
    disabled,
    hidden
  };
}

function isVisible(breakpoint, selectedSource) {
  const sourceId = selectedSource.get("id");
  const isGeneratedSource = isGeneratedId(sourceId);

  const location = getLocation(breakpoint, isGeneratedSource);
  return location.sourceId === sourceId;
}

/*
 * Finds the breakpoints, which appear in the selected source.
 *
 * This
 */
export function getVisibleBreakpoints(state: State) {
  const selectedSource = getSelectedSource(state);
  if (!selectedSource) {
    return null;
  }

  return getBreakpoints(state)
    .filter(bp => isVisible(bp, selectedSource))
    .map(bp => formatBreakpoint(bp, selectedSource));
}
