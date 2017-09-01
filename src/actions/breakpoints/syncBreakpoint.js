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

async function makeScopedLocation({ name, offset }, location, source) {
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
  pendingBreakpoint,
  location,
  generatedLocation,
  previousLocation = null
) {
  const overrides = { ...pendingBreakpoint, generatedLocation };
  const breakpoint = createBreakpoint(location, overrides);

  assertBreakpoint(breakpoint);
  return { breakpoint, previousLocation };
}

// we have three forms of syncing: disabled syncing, existing server syncing
// and adding a new breakpoint
export async function syncClientBreakpoint(
  getState,
  client,
  sourceMaps,
  sourceId,
  pendingBreakpoint: PendingBreakpoint
) {
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

  /** ******* CASE 1: No server change ***********/
  // early return if breakpoint is disabled or we are in the sameLocation
  // send update only to redux
  if (pendingBreakpoint.disabled || isSameLocation) {
    return createSyncData(
      pendingBreakpoint,
      scopedLocation,
      scopedGeneratedLocation
    );
  }

  /** ******* Case 2: Add New Breakpoint ***********/
  // If we are not disabled, set the breakpoint on the server and get
  // that info so we can set it on our breakpoints.
  const existingClient = client.getBreakpointByLocation(generatedLocation);
  // clear server breakpoints if they exist and we have moved
  if (existingClient) {
    await client.removeBreakpoint(generatedLocation);
  }

  const clientBreakpoint = await client.setBreakpoint(
    scopedGeneratedLocation,
    pendingBreakpoint.condition,
    sourceMaps.isOriginalId(sourceId)
  );

  // the breakpoint might have slid server side, so we want to get the location
  // based on the server's return value
  const newGeneratedLocation = clientBreakpoint.actualLocation;
  const newLocation = await sourceMaps.getOriginalLocation(
    newGeneratedLocation
  );

  return createSyncData(
    pendingBreakpoint,
    newLocation,
    newGeneratedLocation,
    previousLocation
  );
}
