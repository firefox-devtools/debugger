/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isOriginalId } from "devtools-source-map";
import { getSource } from "../selectors";

import type { SourceLocation, MappedLocation, Source } from "../types";
import { isGenerated } from "../utils/source";

export async function getGeneratedLocation(
  state: Object,
  source: Source,
  location: SourceLocation,
  sourceMaps: Object
): Promise<SourceLocation> {
  if (!isOriginalId(location.sourceId)) {
    return location;
  }

  const { line, sourceId, column } = await sourceMaps.getGeneratedLocation(
    location,
    source
  );

  const generatedSource = getSource(state, sourceId);
  if (!generatedSource) {
    return location;
  }

  return {
    line,
    sourceId,
    // If the input location didn't have a column number, and we got back
    // the start of the line, we consider the result to also not have a column.
    // This is so that we can preserve our current behavior of having
    // breakpoints with optional columns, while allowing operations on
    // locations unrelated to breakpoints to always have a column.
    column: location.column === undefined && column === 0 ? undefined : column,
    sourceUrl: generatedSource.url
  };
}

export async function getMappedLocation(
  state: Object,
  sourceMaps: Object,
  location: SourceLocation
): Promise<SourceLocation> {
  const source = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isOriginalId(location.sourceId)) {
    return getGeneratedLocation(state, source, location, sourceMaps);
  }

  return sourceMaps.getOriginalLocation(location, source);
}

export function getSelectedLocation(
  mappedLocation: MappedLocation,
  selectedSource: ?Source
) {
  return selectedSource && isGenerated(selectedSource)
    ? mappedLocation.generatedLocation
    : mappedLocation.location;
}
