import {
  getGeneratedLocation,
  locationMoved,
  equalizeLocationColumn,
  breakpointExists
} from "../../../utils/breakpoint";
import { getSource } from "../../../selectors";

export async function addBreakpoint(
  getState,
  client,
  sourceMaps,
  { breakpoint }
) {
  const state = getState();
  if (breakpointExists(state, breakpoint.location)) {
    return { breakpoint };
  }

  const source = getSource(state, breakpoint.location.sourceId);
  const generatedLocation = await getGeneratedLocation(
    source,
    sourceMaps,
    breakpoint.location
  );

  const { id, hitCount, actualLocation } = await client.setBreakpoint(
    generatedLocation,
    breakpoint.condition,
    sourceMaps.isOriginalId(breakpoint.location.sourceId)
  );

  const _location = await sourceMaps.getOriginalLocation(actualLocation);
  const location = equalizeLocationColumn(_location, breakpoint.location);

  const newBreakpoint = {
    ...breakpoint,
    id,
    loading: false,
    location,
    hitCount,
    generatedLocation: actualLocation
  };

  const previousLocation = locationMoved(breakpoint.location, location)
    ? breakpoint.location
    : null;

  return {
    breakpoint: newBreakpoint,
    previousLocation
  };
}
