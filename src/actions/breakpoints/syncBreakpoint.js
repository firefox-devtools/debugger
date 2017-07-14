import {
  getGeneratedLocation,
  formatClientBreakpoint
} from "../../utils/breakpoint";
import { getSource } from "../../selectors";
import { originalToGeneratedId } from "devtools-source-map";

export async function addClientBreakpoint(
  state,
  client,
  sourceMaps,
  breakpoint
) {
  const location = breakpoint.location;
  const source = getSource(state, location.sourceId);
  const generatedLocation = await getGeneratedLocation(
    source,
    sourceMaps,
    location
  );

  const clientBreakpoint = await client.setBreakpoint(
    generatedLocation,
    breakpoint.condition,
    sourceMaps.isOriginalId(breakpoint.location.sourceId)
  );

  const actualLocation = await sourceMaps.getOriginalLocation(
    clientBreakpoint.actualLocation
  );

  const { id, hitCount } = clientBreakpoint;
  return {
    id,
    actualLocation,
    hitCount,
    generatedLocation: clientBreakpoint.actualLocation
  };
}

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
  const oldGeneratedLocation = {
    ...pendingBreakpoint.generatedLocation,
    sourceId: generatedSourceId
  };

  /** ******* CASE 1: Disabled ***********/
  // early return if breakpoint is disabled, send overrides to update
  // the id as expected
  if (pendingBreakpoint.disabled) {
    return {
      id: generatedSourceId,
      actualLocation: { ...pendingBreakpoint.location, id: sourceId },
      generatedLocation: oldGeneratedLocation
    };
  }

  /** ******* CASE 2: Merge Server Breakpoint ***********/
  // early return if breakpoint exists on the server, send overrides
  // to update the id as expected
  const existingClient = client.getBreakpointByLocation(oldGeneratedLocation);

  if (existingClient) {
    return formatClientBreakpoint(
      existingClient,
      sourceMaps,
      pendingBreakpoint.location
    );
  }

  /** ******* CASE 3: Add New Breakpoint ***********/
  // If we are not disabled, set the breakpoint on the server and get
  // that info so we can set it on our breakpoints.
  const clientBreakpoint = await client.setBreakpoint(
    oldGeneratedLocation,
    pendingBreakpoint.condition,
    sourceMaps.isOriginalId(sourceId)
  );

  return formatClientBreakpoint(
    clientBreakpoint,
    sourceMaps,
    pendingBreakpoint.location
  );
}
