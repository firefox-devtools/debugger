/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

//@flow
import { getSource } from "../selectors";

export function getGeneratedSourceId(originalId: String) {
  const match = originalId.match(/(.*)\/originalSource/);
  return match ? match[1] : "";
}

export function isOriginal(sourceId: String) {
  if (!sourceId) {
    return false;
  }
  return !!getGeneratedSourceId(sourceId);
}

export async function getGeneratedLocation(
  state: Object,
  source: SourceRecord,
  location: Location,
  sourceMaps: Object
) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  const { line, sourceId, column } = await sourceMaps.getGeneratedLocation(
    location,
    source
  );

  const generatedSource = getSource(state, sourceId);
  const sourceUrl = generatedSource.get("url");
  return {
    line,
    sourceId,
    column: column === 0 ? undefined : column,
    sourceUrl
  };
}
