/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { originalToGeneratedId, isOriginalId } from "devtools-source-map";
import { getSelectedFrame } from "../reducers/pause";
import { getSelectedLocation } from "../reducers/sources";

function visibleSourceId(location) {
  return isOriginalId(location.sourceId)
    ? originalToGeneratedId(location.sourceId)
    : location.sourceId;
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

  return (
    visibleSourceId(selectedLocation) ===
    visibleSourceId(selectedFrame.location)
  );
}
