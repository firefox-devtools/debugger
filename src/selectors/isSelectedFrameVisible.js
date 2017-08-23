import { getSelectedFrame } from "../reducers/pause";
import { getSelectedLocation } from "../reducers/sources";
/*
 * Checks to if the selected frame's source is currently
 * selected.
 */
export default function isSelectedFrameVisible(state) {
  const selectedLocation = getSelectedLocation(state);
  const selectedFrame = getSelectedFrame(state);

  return (
    selectedFrame &&
    selectedLocation &&
    selectedFrame.location.sourceId == selectedLocation.sourceId
  );
}
