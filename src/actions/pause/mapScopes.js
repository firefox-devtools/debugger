// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getSource, getSelectedFrame } from "../../selectors";
import { updateScopeBindings } from "../../utils/pause";
import { isGeneratedId } from "devtools-source-map";

import type { ThunkArgs } from "../types";

export function mapScopes() {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    if (!frame) {
      return;
    }

    if (isGeneratedId(frame.location.sourceId)) {
      return;
    }

    const sourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    if (sourceRecord.get("isWasm")) {
      return;
    }

    const frameScopes = await client.getFrameScopes(frame);
    const scopes = await updateScopeBindings(
      frameScopes,
      frame.generatedLocation,
      sourceMaps
    );

    dispatch({
      type: "MAP_SCOPES",
      frame,
      scopes
    });
  };
}
