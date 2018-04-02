/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  locationMoved,
  breakpointExists,
  assertBreakpoint,
  getASTLocation,
  assertLocation
} from "../../utils/breakpoint";
import { getSource, getSymbols } from "../../selectors";
import { getGeneratedLocation } from "../../utils/source-maps";
import { getTextAtPosition } from "../../utils/source";

export default async function addBreakpoint(
  getState,
  client,
  sourceMaps,
  breakpoint
) {
  const state = getState();
  const source = getSource(state, breakpoint.location.sourceId);

  const location = { ...breakpoint.location, sourceUrl: source.url };
  const generatedLocation = await getGeneratedLocation(
    state,
    source.toJS(),
    location,
    sourceMaps
  );

  const generatedSource = getSource(state, generatedLocation.sourceId);

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

  const symbols = getSymbols(getState(), source);
  const astLocation = await getASTLocation(source, symbols, newLocation);

  const originalText = getTextAtPosition(source, location);
  const text = getTextAtPosition(generatedSource, actualLocation);

  const newBreakpoint = {
    id,
    disabled: false,
    hidden: breakpoint.hidden,
    loading: false,
    condition: breakpoint.condition,
    location: newLocation,
    astLocation,
    hitCount,
    generatedLocation: newGeneratedLocation,
    text,
    originalText
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
