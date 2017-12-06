/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSource, getSelectedFrame, getFrameScope } from "../../selectors";
import { features } from "../../utils/prefs";
import { isGeneratedId } from "devtools-source-map";
import { loadSourceText } from "../sources/loadSourceText";
import { getScopes } from "../../workers/parser";

// eslint-disable-next-line max-len
import { updateScopeBindings } from "devtools-map-bindings/src/updateScopeBindings";

import type { Frame, Scope, SourceScope } from "debugger-html";

import type { ThunkArgs } from "../types";

function mapScopes(scopes: Scope, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const mappedScopes = await updateScopeBindings(
      scopes,
      frame.generatedLocation,
      frame.location,
      {
        async getSourceMapsScopes(location) {
          const astScopes: ?(SourceScope[]) = await getScopes(location);
          return sourceMaps.getLocationScopes(location, astScopes);
        },
        async getOriginalSourceScopes(location) {
          const source = getSource(getState(), location.sourceId).toJS();
          await dispatch(loadSourceText(source));
          return getScopes(location);
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
