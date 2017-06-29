// @flow

import type { Source } from "debugger-html";
import type { AstLocation, AstPosition } from "./types";

import get from "lodash/fp/get";

import { containsLocation, containsPosition } from "./utils/helpers";

import getSymbols from "./getSymbols";

function findFunctions(source) {
  const symbols = getSymbols(source);
  return symbols.functions;
}

/**
 * Returns the location for a given function path. If the path represents a
 * function declaration, the location will begin after the function identifier
 * but before the function parameters.
 */

function getLocation(func) {
  const location = { ...func.location };

  // if the function has an identifier, start the block after it so the
  // identifier is included in the "scope" of its parent
  const identifierEnd = get("identifier.loc.end", func);
  if (identifierEnd) {
    location.start = identifierEnd;
  }

  return location;
}

/**
 * Reduces an array of locations to remove items that are completely enclosed
 * by another location in the array.
 */
function removeOverlaps(
  locations: AstLocation | AstLocation[],
  location: AstLocation
) {
  // support reducing without an initializing array
  if (!Array.isArray(locations)) {
    locations = [locations];
  }

  const contains =
    locations.filter(a => containsLocation(a, location)).length > 0;

  if (!contains) {
    locations.push(location);
  }

  return locations;
}

/**
 * Sorts an array of locations by start position
 */
function sortByStart(a: AstLocation, b: AstLocation) {
  if (a.start.line < b.start.line) {
    return -1;
  } else if (a.start.line === b.start.line) {
    return a.start.column - b.start.column;
  }

  return 1;
}

/**
 * Returns an array of locations that are considered out of scope for the given
 * location.
 */
function getOutOfScopeLocations(
  source: Source,
  position: AstPosition
): AstLocation[] {
  return findFunctions(source)
    .map(getLocation)
    .filter(loc => !containsPosition(loc, position))
    .reduce(removeOverlaps, [])
    .sort(sortByStart);
}

export default getOutOfScopeLocations;
