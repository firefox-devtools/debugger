/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSource, getSelectedFrame, getFrameScope } from "../../selectors";
import { updateScopeBindings } from "../../utils/pause";
import { features } from "../../utils/prefs";
import { isGeneratedId } from "devtools-source-map";
import { loadSourceText } from "../sources/loadSourceText";

import type { ThunkArgs } from "../types";
import type { Scope, Frame } from "debugger-html";

function mapScopes(scopes: Scope, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const mappedScopes = await updateScopeBindings(
      scopes,
      frame.generatedLocation,
      frame.location,
      {
        async getLocationScopes(location, astScopes) {
          return sourceMaps.getLocationScopes(location, astScopes);
        },
        async loadSourceText(sourceId) {
          const source = getSource(getState(), sourceId).toJS();
          await dispatch(loadSourceText(source));
        }
      }
    );

    dispatch({
      type: "MAP_SCOPES",
      frame,
      scopes: mappedScopes
    });
  };
}

export function fetchScopes() {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());

    if (!frame || getFrameScope(getState(), frame.id)) {
      return;
    }

    const scopes = await client.getFrameScopes(frame);
    dispatch({
      type: "ADD_SCOPES",
      frame,
      scopes
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
