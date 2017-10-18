// @flow

import { getSource, getSelectedFrame, getFrameScope } from "../../selectors";
import { updateScopeBindings } from "../../utils/pause";
import { isGeneratedId } from "devtools-source-map";

import type { ThunkArgs } from "../types";

export function fetchScopes() {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());

    if (!frame || getFrameScope(getState(), frame.id)) {
      return;
    }

    const sourceRecord = getSource(getState(), frame.location.sourceId);

    if (sourceRecord.get("isPrettyPrinted")) {
      return;
    }

    const generatedSourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    if (generatedSourceRecord.get("isWasm")) {
      return;
    }

    const scopes = await client.getFrameScopes(frame);
    dispatch({
      type: "ADD_SCOPES",
      frame,
      scopes
    });

    if (isGeneratedId(frame.location.sourceId)) {
      return;
    }

    const mappedScopes = await updateScopeBindings(
      scopes,
      frame.generatedLocation,
      frame.location,
      sourceMaps
    );

    dispatch({
      type: "MAP_SCOPES",
      frame,
      scopes: mappedScopes
    });
  };
}
