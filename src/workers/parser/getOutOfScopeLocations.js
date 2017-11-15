/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Source } from "debugger-html";
import type { AstLocation, AstPosition } from "./types";

import get from "lodash/fp/get";

import { containsLocation, containsPosition } from "./utils/contains";

import getSymbols from "./getSymbols";

function findSymbols(source) {
  const { functions, comments } = getSymbols(source);
  return { functions, comments };
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
 * Return an new locations array which excludes
 * items that are completely enclosed by another location in the input locations
 *
 * @param locations Notice! The locations MUST be sorted by `sortByStart`
 *                  so that we can do linear time complexity operation.
 */
function removeOverlaps(locations: AstLocation[]) {
  const newLocs = [];
  const length = locations.length;
  if (length) {
    newLocs.push(locations[0]);
    for (let i = 1, parentIdx = 0; i < length; i++) {
      const loc = locations[i];
      if (containsLocation(locations[parentIdx], loc) == false) {
        newLocs.push(loc);
        parentIdx = i;
      }
    }
  }
  return newLocs;
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
  const { functions, comments } = findSymbols(source);
  const commentLocations = comments.map(c => c.location);
  const locations = functions
    .map(getLocation)
    .concat(commentLocations)
    .sort(sortByStart)
    .filter(loc => !containsPosition(loc, position));
  return removeOverlaps(locations);
}

export default getOutOfScopeLocations;
