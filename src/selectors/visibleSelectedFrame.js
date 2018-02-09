/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedLocation } from "../reducers/sources";
import { getSelectedFrame } from "../reducers/pause";
import { isOriginalId } from "devtools-source-map";
import { createSelector } from "reselect";

import type { Frame, Location } from "../types";

function getLocation(frame: Frame, location?: Location) {
  if (!location) {
    return frame.location;
  }

  return !isOriginalId(location.sourceId)
    ? frame.generatedLocation || frame.location
    : frame.location;
}

export const getVisibleSelectedFrame = createSelector(
  getSelectedLocation,
  getSelectedFrame,
  (selectedLocation, selectedFrame) => {
    if (!selectedFrame) {
      return null;
    }

    const { id } = selectedFrame;

    return {
      id,
      location: getLocation(selectedFrame, selectedLocation)
    };
  }
);
