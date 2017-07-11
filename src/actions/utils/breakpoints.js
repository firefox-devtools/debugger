import { getBreakpoint } from "../../selectors";

export async function formatClientBreakpoint(
  clientBreakpoint,
  sourceMaps,
  location
) {
  const clientOriginalLocation = await sourceMaps.getOriginalLocation(
    clientBreakpoint.actualLocation
  );

  // make sure that we are re-adding the same type of breakpoint. Column
  // or line
  const actualLocation = clientOriginalLocation;

  // the generatedLocation might have slid, so now we can adjust it
  const generatedLocation = clientBreakpoint.actualLocation;

  const { id, hitCount } = clientBreakpoint;
  return { id, actualLocation, hitCount, generatedLocation };
}

export function breakpointExists(state, location: Location) {
  const currentBp = getBreakpoint(state, location);
  return currentBp && !currentBp.disabled;
}

export function createBreakpoint(location: Object, overrides: Object = {}) {
  const { condition, disabled, generatedLocation } = overrides;
  const properties = {
    condition: condition || null,
    disabled: disabled || false,
    generatedLocation,
    location
  };

  return properties;
}

export async function getGeneratedLocation(source, sourceMaps, location) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  return await sourceMaps.getGeneratedLocation(location, source.toJS());
}

export function equalizeLocationColumn(location, referenceLocation) {
  if (referenceLocation.column) {
    return location;
  }
  return { ...location, column: undefined };
}
