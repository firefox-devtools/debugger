/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getSource,
  hasSymbols,
  getSelectedLocation,
  isPaused
} from "../selectors";

import { mapFrames, fetchExtra } from "./pause";

import { setInScopeLines } from "./ast/setInScopeLines";
import {
  getSymbols,
  findOutOfScopeLocations,
  getFramework,
  getPausePoints
} from "../workers/parser";

import { PROMISE } from "./utils/middleware/promise";
import { isGeneratedId } from "devtools-source-map";

import type { SourceId } from "../types";
import type { ThunkArgs, Action } from "./types";

export function setSourceMetaData(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    if (!source || !source.text || source.isWasm) {
      return;
    }

    const framework = await getFramework(source.id);

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
    const source = getSource(getState(), sourceId);
    if (
      !source ||
      !source.text ||
      source.isWasm ||
      hasSymbols(getState(), source)
    ) {
      return;
    }

    await dispatch(
      ({
        type: "SET_SYMBOLS",
        source: source.toJS(),
        [PROMISE]: getSymbols(source.id)
      }: Action)
    );

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

    const source = getSource(getState(), location.sourceId);

    let locations = null;
    if (location.line && source && isPaused(getState())) {
      locations = await findOutOfScopeLocations(source.get("id"), location);
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

export function setPausePoints(sourceId: SourceId) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    if (!source || !source.text || source.isWasm) {
      return;
    }

    const pausePoints = await getPausePoints(source.id);

    if (isGeneratedId(source.id)) {
      await client.setPausePoints(source.id, pausePoints);
    }

    dispatch(
      ({
        type: "SET_PAUSE_POINTS",
        source: source.toJS(),
        pausePoints
      }: Action)
    );
  };
}
