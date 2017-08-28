import {
  makeLocationId,
  locationMoved,
  assertBreakpoint,
  assertPendingBreakpoint
} from "../../utils/breakpoint";
import { originalToGeneratedId } from "devtools-source-map";

// we have three forms of syncing: disabled syncing, existing server syncing
// and adding a new breakpoint
export async function syncClientBreakpoint(
  sourceId: string,
  client,
  sourceMaps,
  pendingBreakpoint: PendingBreakpoint
) {
  const generatedSourceId = sourceMaps.isOriginalId(sourceId)
    ? originalToGeneratedId(sourceId)
    : sourceId;

  // this is the generatedLocation of the pending breakpoint, with
  // the source id updated to reflect the new connection
  const generatedLocation = {
    ...pendingBreakpoint.generatedLocation,
    sourceId: generatedSourceId
  };

  const location = {
    ...pendingBreakpoint.location,
    sourceId: generatedSourceId
  };

  assertPendingBreakpoint(pendingBreakpoint);

  /** ******* CASE 1: Disabled ***********/
  // early return if breakpoint is disabled, send overrides to update
  // the id as expected
  if (pendingBreakpoint.disabled) {
    const newLocation = await sourceMaps.getOriginalLocation(generatedLocation);

    const breakpoint = {
      ...pendingBreakpoint,
      id: makeLocationId(newLocation),
      generatedLocation,
      location: newLocation
    };

    const previousLocation = locationMoved(location, newLocation)
      ? location
      : null;

    assertBreakpoint(breakpoint);
    return { breakpoint, previousLocation };
  }

  /** ******* CASE 2: Merge Server Breakpoint ***********/
  // early return if breakpoint exists on the server, send overrides
  // to update the id as expected
  const existingClient = client.getBreakpointByLocation(generatedLocation);

  if (existingClient) {
    // const newGeneratedLocation = existingClient.actualLocation;
    // const newLocation = await sourceMaps.getOriginalLocation(
    //   newGeneratedLocation
    // );

    const breakpoint = {
      ...pendingBreakpoint,
      id: makeLocationId(location),
      generatedLocation: generatedLocation,
      location: location
    };

    assertBreakpoint(breakpoint);
    return { breakpoint, previousLocation: location };
  }

  /** ******* CASE 3: Add New Breakpoint ***********/
  // If we are not disabled, set the breakpoint on the server and get
  // that info so we can set it on our breakpoints.
  const clientBreakpoint = await client.setBreakpoint(
    generatedLocation,
    pendingBreakpoint.condition,
    sourceMaps.isOriginalId(sourceId)
  );

  const newGeneratedLocation = clientBreakpoint.actualLocation;
  const newLocation = await sourceMaps.getOriginalLocation(
    newGeneratedLocation
  );

  const breakpoint = {
    ...pendingBreakpoint,
    id: makeLocationId(newGeneratedLocation),
    generatedLocation: newGeneratedLocation,
    location: newLocation
  };

  assertBreakpoint(breakpoint);
  return { breakpoint, previousLocation: location };
}
