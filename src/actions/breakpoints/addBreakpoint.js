import {
  getGeneratedLocation,
  locationMoved,
  breakpointExists,
  assertBreakpoint,
  assertLocation
} from "../../utils/breakpoint";
import { getSource } from "../../selectors";

async function _getGeneratedLocation(state, source, sourceMaps, location) {
  const generatedLocation = await getGeneratedLocation(
    source,
    sourceMaps,
    location
  );

  const generatedSource = getSource(state, generatedLocation.sourceId);
  const sourceUrl = generatedSource.get("url");
  return { ...generatedLocation, sourceUrl };
}

export default async function addBreakpoint(
  getState,
  client,
  sourceMaps,
  { breakpoint }
) {
  const state = getState();

  const source = getSource(state, breakpoint.location.sourceId);
  const location = { ...breakpoint.location, sourceUrl: source.get("url") };
  const generatedLocation = await _getGeneratedLocation(
    state,
    source,
    sourceMaps,
    location
  );

  assertLocation(location);
  assertLocation(generatedLocation);

  if (breakpointExists(state, location)) {
    const newBreakpoint = { ...breakpoint, location, generatedLocation };
    assertBreakpoint(newBreakpoint);
    return { breakpoint: newBreakpoint };
  }

  const { id, hitCount, actualLocation } = await client.setBreakpoint(
    generatedLocation,
    breakpoint.condition,
    sourceMaps.isOriginalId(location.sourceId)
  );

  const newGeneratedLocation = actualLocation || generatedLocation;
  const newLocation = await sourceMaps.getOriginalLocation(
    newGeneratedLocation
  );

  const newBreakpoint = {
    id,
    disabled: false,
    loading: false,
    condition: breakpoint.condition,
    location: newLocation,
    hitCount,
    generatedLocation: newGeneratedLocation
  };

  assertBreakpoint(newBreakpoint);

  const previousLocation = locationMoved(location, newLocation)
    ? location
    : null;

  return {
    breakpoint: newBreakpoint,
    previousLocation
  };
}
