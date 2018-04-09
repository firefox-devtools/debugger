/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSource } from "../../selectors";
import { loadSourceText } from "../sources/loadSourceText";
import {
  getScopes,
  type SourceScope,
  type BindingData,
  type BindingLocation
} from "../../workers/parser";
import type { RenderableScope } from "../../utils/pause/scopes/getScope";
import { PROMISE } from "../utils/middleware/promise";
import { locColumn, buildMappedScopes } from "../../utils/pause/mapScopes";

import { features } from "../../utils/prefs";
import { log } from "../../utils/log";
import { isGeneratedId } from "devtools-source-map";
import type {
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "../../types";

import type { ThunkArgs } from "../types";

export type OriginalScope = RenderableScope;

export function mapScopes(scopes: Promise<Scope>, frame: Frame) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const generatedSourceRecord = getSource(
      getState(),
      frame.generatedLocation.sourceId
    );

    const sourceRecord = getSource(getState(), frame.location.sourceId);

    const shouldMapScopes =
      features.mapScopes &&
      !generatedSourceRecord.isWasm &&
      !sourceRecord.isPrettyPrinted &&
      !isGeneratedId(frame.location.sourceId);

    if (!shouldMapScopes) {
      return null;
    }

    await dispatch(loadSourceText(sourceRecord));
    const originalAstScopes = await getScopes(frame.location);
    const generatedAstScopes = await getScopes(frame.generatedLocation);

    if (!originalAstScopes || !generatedAstScopes) {
      return null;
    }

    dispatch({
      type: "MAP_SCOPES",
      frame,
      [PROMISE]: buildMappedScopes(
        sourceRecord.toJS(),
        frame,
        originalAstScopes,
        generatedAstScopes,
        await scopes,
        sourceMaps,
        client
      )
    });
  };
}
