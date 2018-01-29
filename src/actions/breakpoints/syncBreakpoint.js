/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import {
  locationMoved,
  createBreakpoint,
  assertBreakpoint,
  assertPendingBreakpoint,
  findScopeByName
} from "../../utils/breakpoint";

import { getGeneratedLocation } from "../../utils/source-maps";
import { originalToGeneratedId } from "devtools-source-map";
import { getSource } from "../../selectors";
import type {
  Location,
  ASTLocation,
  PendingBreakpoint,
  SourceId,
  Breakpoint
} from "debugger-html";

type BreakpointSyncData = {
  previousLocation: Location,
  breakpoint: ?Breakpoint
};

async function makeScopedLocation(
  { name, offset }: ASTLocation,
  location: Location,
  source
) {
  const scope = await findScopeByName(source, name);
  // fallback onto the location line, if the scope is not found
  // note: we may at some point want to delete the breakpoint if the scope
  // disappears
  const line = scope ? scope.location.start.line + offset.line : location.line;
  return {
    line,
    column: location.column,
    sourceUrl: source.url,
    sourceId: source.id
  };
}

function createSyncData(
  id: SourceId,
  pendingBreakpoint: PendingBreakpoint,
  location: Location,
  generatedLocation: Location,
  previousLocation: Location
): BreakpointSyncData {
  const overrides = { ...pendingBreakpoint, generatedLocation, id };
  const breakpoint = createBreakpoint(location, overrides);

  assertBreakpoint(breakpoint);
  return { breakpoint, previousLocation };
}

// we have three forms of syncing: disabled syncing, existing server syncing
// and adding a new breakpoint
export async function syncClientBreakpoint(
  getState: Function,
  client: Object,
  sourceMaps: Object,
  sourceId: SourceId,
  pendingBreakpoint: PendingBreakpoint
): Promise<BreakpointSyncData> {
  assertPendingBreakpoint(pendingBreakpoint);

  const source = getSource(getState(), sourceId).toJS();
  const generatedSourceId = sourceMaps.isOriginalId(sourceId)
    ? originalToGeneratedId(sourceId)
    : sourceId;

  const { location, astLocation } = pendingBreakpoint;
  const previousLocation = { ...location, sourceId };

  const scopedLocation = await makeScopedLocation(
    astLocation,
    previousLocation,
    source
  );

  const scopedGeneratedLocation = await getGeneratedLocation(
    getState(),
    source,
    scopedLocation,
    sourceMaps
  );

  // this is the generatedLocation of the pending breakpoint, with
  // the source id updated to reflect the new connection
  const generatedLocation = {
    ...pendingBreakpoint.generatedLocation,
    sourceId: generatedSourceId
  };

  const isSameLocation = !locationMoved(
    generatedLocation,
    scopedGeneratedLocation
  );

  const existingClient = client.getBreakpointByLocation(generatedLocation);

  /** ******* CASE 1: No server change ***********/
  // early return if breakpoint is disabled or we are in the sameLocation
  // send update only to redux
  if (pendingBreakpoint.disabled || (existingClient && isSameLocation)) {
    const id = pendingBreakpoint.disabled ? "" : existingClient.id;
    return createSyncData(
      id,
      pendingBreakpoint,
      scopedLocation,
      scopedGeneratedLocation,
      previousLocation
    );
  }

  // clear server breakpoints if they exist and we have moved
  if (existingClient) {
    await client.removeBreakpoint(generatedLocation);
  }

  /** ******* Case 2: Add New Breakpoint ***********/
  // If we are not disabled, set the breakpoint on the server and get
  // that info so we can set it on our breakpoints.

  if (!scopedGeneratedLocation.line) {
    return { previousLocation, breakpoint: null };
  }

  const { id, actualLocation } = await client.setBreakpoint(
    scopedGeneratedLocation,
    pendingBreakpoint.condition,
    sourceMaps.isOriginalId(sourceId)
  );

  // the breakpoint might have slid server side, so we want to get the location
  // based on the server's return value
  const newGeneratedLocation = actualLocation;
  const newLocation = await sourceMaps.getOriginalLocation(
    newGeneratedLocation
  );

  return createSyncData(
    id,
    pendingBreakpoint,
    newLocation,
    newGeneratedLocation,
    previousLocation
  );
}
