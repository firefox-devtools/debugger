/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
// @flow
import { getSelectedFrame } from "../reducers/pause";
import { getSelectedLocation } from "../reducers/sources";

/*
 * Checks to if the selected frame's source is currently
 * selected.
 */
export function isSelectedFrameVisible(state) {
  const selectedLocation = getSelectedLocation(state);
  const selectedFrame = getSelectedFrame(state);

  return (
    selectedFrame &&
    selectedLocation &&
    selectedFrame.location.sourceId == selectedLocation.sourceId
  );
}
