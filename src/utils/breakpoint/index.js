import { isEnabled } from "devtools-config";
import { getBreakpoint } from "../../selectors";

// Return the first argument that is a string, or null if nothing is a
// string.
export function firstString(...args) {
  for (let arg of args) {
    if (typeof arg === "string") {
      return arg;
    }
  }
  return null;
}

export function locationMoved(location, newLocation) {
  return (
    location.line !== newLocation.line || location.column !== newLocation.column
  );
}

export function makeLocationId(location: Location) {
  const { sourceId, line, column } = location;
  const columnString = column || "";
  return `${sourceId}:${line}:${columnString}`;
}

export function makePendingLocationId(location: Location) {
  const { sourceUrl, line, column } = location;
  const sourceUrlString = sourceUrl || "";
  const columnString = column || "";
  return `${sourceUrlString}:${line}:${columnString}`;
}

export function allBreakpointsDisabled(state) {
  return state.breakpoints.every(x => x.disabled);
}

// syncing
export function equalizeLocationColumn(location, referenceLocation) {
  if (referenceLocation.column) {
    return location;
  }
  return { ...location, column: undefined };
}

export function breakpointAtLocation(
  breakpoints,
  { line, column = undefined }
) {
  return breakpoints.find(breakpoint => {
    const sameLine = breakpoint.location.line === line + 1;
    if (!sameLine) {
      return false;
    }

    // NOTE: when column breakpoints are disabled we want to find
    // the first breakpoint
    if (!isEnabled("columnBreakpoints")) {
      return true;
    }

    return breakpoint.location.column === column;
  });
}

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
  const actualLocation = equalizeLocationColumn(
    clientOriginalLocation,
    location
  );

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
    id: makeLocationId(location),
    condition: condition || null,
    disabled: disabled || false,
    generatedLocation,
    location
  };

  return properties;
}

export function createPendingBreakpoint(bp: any) {
  const {
    location: { sourceUrl, line, column },
    condition,
    disabled,
    generatedLocation
  } = bp;

  const location = { sourceUrl, line, column };
  const id = makePendingLocationId(location);
  return { condition, disabled, generatedLocation, location, id };
}

export async function getGeneratedLocation(source, sourceMaps, location) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  return await sourceMaps.getGeneratedLocation(location, source.toJS());
}
