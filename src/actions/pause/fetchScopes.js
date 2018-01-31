/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSource, getSelectedFrame, getFrameScope } from "../../selectors";
import { features } from "../../utils/prefs";
import { isGeneratedId } from "devtools-source-map";
import { mapScopes } from "./mapScopes";
import { PROMISE } from "../utils/middleware/promise";

import type { ThunkArgs } from "../types";

export function fetchScopes() {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    if (!frame || getFrameScope(getState(), frame.id)) {
      return;
    }

    const scopes = dispatch({
      type: "ADD_SCOPES",
      frame,
      [PROMISE]: client.getFrameScopes(frame)
    });

    const generatedSourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    if (generatedSourceRecord.get("isWasm")) {
      return;
    }

    const sourceRecord = getSource(getState(), frame.location.sourceId);
    if (sourceRecord.get("isPrettyPrinted")) {
      return;
    }

    if (isGeneratedId(frame.location.sourceId)) {
      return;
    }

    if (features.mapScopes) {
      dispatch(mapScopes(scopes, frame));
    }
  };
}
