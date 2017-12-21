/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getSelectedLocation } from "../reducers/sources";
import { getSelectedFrame } from "../reducers/pause";
import { isOriginalId } from "devtools-source-map";

function getLocation(frame, isGeneratedSource) {
  return isGeneratedSource
    ? frame.generatedLocation || frame.location
    : frame.location;
}

export default function getVisibleSelectedFrame(state: OuterState) {
  const selectedLocation = getSelectedLocation(state);
  const isGeneratedSource = !isOriginalId(selectedLocation.sourceId);
  const selectedFrame = getSelectedFrame(state);

  if (!selectedFrame) {
    return;
  }

  return {
    location: getLocation(selectedFrame, isGeneratedSource)
  };
}
