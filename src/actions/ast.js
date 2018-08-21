/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getSource,
  getSourceFromId,
  hasSymbols,
  getSelectedLocation,
  isPaused
} from "../selectors";

import { mapFrames, fetchExtra } from "./pause";
import { updateTab } from "./tabs";

import { setInScopeLines } from "./ast/setInScopeLines";
import {
  getSymbols,
  findOutOfScopeLocations,
  getFramework,
  getPausePoints
} from "../workers/parser";

import { PROMISE } from "./utils/middleware/promise";
import { isGeneratedId } from "devtools-source-map";
import { features } from "../utils/prefs";
import { isLoaded } from "../utils/source";

import type { SourceId } from "../types";
import type { ThunkArgs, Action } from "./types";

export function setSourceMetaData(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    if (!source || !isLoaded(source) || source.isWasm) {
      return;
    }

    const framework = await getFramework(source.id);
    dispatch(updateTab(source.url, framework));

    dispatch(
      ({
        type: "SET_SOURCE_METADATA",
        sourceId: source.id,
        sourceMetaData: {
          framework
        }
      }: Action)
    );
  };
}

export function setSymbols(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSourceFromId(getState(), sourceId);

    if (source.isWasm || hasSymbols(getState(), source)) {
      return;
    }

    await dispatch({
      type: "SET_SYMBOLS",
      sourceId,
      [PROMISE]: getSymbols(sourceId)
    });

    if (isPaused(getState())) {
      await dispatch(fetchExtra());
      await dispatch(mapFrames());
    }

    await dispatch(setPausePoints(sourceId));
    await dispatch(setSourceMetaData(sourceId));
  };
}

export function setOutOfScopeLocations() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const location = getSelectedLocation(getState());
    if (!location) {
      return;
    }

    const source = getSourceFromId(getState(), location.sourceId);

    let locations = null;
    if (location.line && source && !source.isWasm && isPaused(getState())) {
      locations = await findOutOfScopeLocations(source.id, location);
    }

    dispatch(
      ({
        type: "OUT_OF_SCOPE_LOCATIONS",
        locations
      }: Action)
    );
    dispatch(setInScopeLines());
  };
}

function compressPausePoints(pausePoints) {
  const compressed = {};
  for (const line in pausePoints) {
    compressed[line] = {};
    for (const col in pausePoints[line]) {
      const point = pausePoints[line][col];
      compressed[line][col] = (point.break && 1) | (point.step && 2);
    }
  }

  return compressed;
}

export function setPausePoints(sourceId: SourceId) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const source = getSourceFromId(getState(), sourceId);
    if (!features.pausePoints || !source || !source.text) {
      return;
    }

    if (source.isWasm) {
      return;
    }

    const pausePoints = await getPausePoints(sourceId);
    const compressed = compressPausePoints(pausePoints);

    if (isGeneratedId(sourceId)) {
      await client.setPausePoints(sourceId, compressed);
    }

    dispatch(
      ({
        type: "SET_PAUSE_POINTS",
        sourceText: source.text || "",
        sourceId,
        pausePoints
      }: Action)
    );
  };
}
