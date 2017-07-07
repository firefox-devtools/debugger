import { isGeneratedId } from "devtools-source-map";
import { isEnabled } from "devtools-config";

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
    location.line !== newLocation.line ||
    (location.column != null && location.column !== newLocation.column)
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
  selectedLocation,
  { line, column = undefined }
) {
  const isGeneratedSource = isGeneratedId(selectedLocation.sourceId);

  return breakpoints.find(breakpoint => {
    const location = isGeneratedSource
      ? breakpoint.generatedLocation
      : breakpoint.location;

    const sameLine = location.line === line + 1;
    if (!sameLine) {
      return false;
    }

    // NOTE: when column breakpoints are disabled we want to find
    // the first breakpoint
    if (!isEnabled("columnBreakpoints")) {
      return true;
    }

    return location.column === column;
  });
}
