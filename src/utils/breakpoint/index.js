// @flow

import { isEnabled } from "devtools-config";
import { getBreakpoint } from "../../selectors";
import assert from "../assert";
export { getASTLocation, findScopeByName } from "./astBreakpointLocation";

import type {
  Location,
  PendingLocation,
  Breakpoint,
  PendingBreakpoint
} from "debugger-html";

import type { State } from "../../reducers/types";

// Return the first argument that is a string, or null if nothing is a
// string.
export function firstString(...args: string[]) {
  for (const arg of args) {
    if (typeof arg === "string") {
      return arg;
    }
  }
  return null;
}

export function locationMoved(location: Location, newLocation: Location) {
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
  assertPendingLocation(location);
  const { sourceUrl, line, column } = location;
  const sourceUrlString = sourceUrl || "";
  const columnString = column || "";

  return `${sourceUrlString}:${line}:${columnString}`;
}

export function assertBreakpoint(breakpoint: Breakpoint) {
  assertLocation(breakpoint.location);
  assertLocation(breakpoint.generatedLocation);
}

export function assertPendingBreakpoint(pendingBreakpoint: PendingBreakpoint) {
  assertPendingLocation(pendingBreakpoint.location);
  assertPendingLocation(pendingBreakpoint.generatedLocation);
}

export function assertLocation(location: Location) {
  assertPendingLocation(location);
  const { sourceId } = location;
  assert(!!sourceId, "location must have a source id");
}

export function assertPendingLocation(location: PendingLocation) {
  assert(!!location, "location must exist");

  const { sourceUrl } = location;

  // sourceUrl is null when the source does not have a url
  assert(sourceUrl !== undefined, "location must have a source url");
  assert(location.hasOwnProperty("line"), "location must have a line");
  assert(
    location.hasOwnProperty("column") != null,
    "location must have a column"
  );
}

// syncing
export function breakpointAtLocation(
  breakpoints: Breakpoint[],
  { line, column }: Location
) {
  return breakpoints.find(breakpoint => {
    const sameLine = breakpoint.location.line === line;
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

export function breakpointExists(state: State, location: Location) {
  const currentBp = getBreakpoint(state, location);
  return currentBp && !currentBp.disabled;
}

export function createBreakpoint(location: Location, overrides: Object = {}) {
  const {
    condition,
    disabled,
    hidden,
    generatedLocation,
    astLocation
  } = overrides;

  const properties = {
    condition: condition || null,
    disabled: disabled || false,
    hidden: hidden || false,
    astLocation: astLocation || { offset: location },
    generatedLocation: generatedLocation || location,
    location
  };

  return properties;
}

function createPendingLocation(location: PendingLocation) {
  const { sourceUrl, line, column } = location;
  return { sourceUrl, line, column };
}

export function createPendingBreakpoint(bp: Breakpoint) {
  const pendingLocation = createPendingLocation(bp.location);
  const pendingGeneratedLocation = createPendingLocation(bp.generatedLocation);

  assertPendingLocation(pendingLocation);

  return {
    condition: bp.condition,
    disabled: bp.disabled,
    location: pendingLocation,
    astLocation: bp.astLocation,
    generatedLocation: pendingGeneratedLocation
  };
}
