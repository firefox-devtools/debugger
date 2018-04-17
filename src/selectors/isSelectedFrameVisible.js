/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { originalToGeneratedId, isOriginalId } from "devtools-source-map";
import { getSelectedFrame } from "../reducers/pause";
import { getSelectedLocation } from "../reducers/sources";

function getGeneratedId(sourceId) {
  if (isOriginalId(sourceId)) {
    return originalToGeneratedId(sourceId);
  }

  return sourceId;
}

/*
 * Checks to if the selected frame's source is currently
 * selected.
 */
export function isSelectedFrameVisible(state) {
  const selectedLocation = getSelectedLocation(state);
  const selectedFrame = getSelectedFrame(state);

  if (!selectedFrame || !selectedLocation) {
    return false;
  }

  if (isOriginalId(selectedLocation.sourceId)) {
    return selectedLocation.sourceId === selectedFrame.location.sourceId;
  }

  return (
    selectedLocation.sourceId ===
    getGeneratedId(selectedFrame.location.sourceId)
  );
}
