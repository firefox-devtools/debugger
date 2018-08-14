/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { isOriginalId } from "devtools-source-map";
import { getSource } from "../selectors";

export async function getGeneratedLocation(
  state: Object,
  source: Source,
  location: Location,
  sourceMaps: Object
) {
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
    column: column === 0 ? undefined : column,
    sourceUrl: generatedSource.url
  };
}

export async function getMappedLocation(
  state: Object,
  sourceMaps: Object,
  location: Location
) {
  const source = getSource(state, location.sourceId);

  if (isOriginalId(location.sourceId)) {
    return getGeneratedLocation(state, source, location, sourceMaps);
  }

  return sourceMaps.getOriginalLocation(location, source);
}
