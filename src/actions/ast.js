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

import { setInScopeLines } from "./ast/setInScopeLines";
import {
  getSymbols,
  getEmptyLines,
  findOutOfScopeLocations,
  getFramework
} from "../workers/parser";

import type { SourceId } from "../types";
import type { ThunkArgs } from "./types";

export function setSourceMetaData(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (
      !sourceRecord ||
      !sourceRecord.get("text") ||
      sourceRecord.get("isWasm")
    ) {
      return;
    }
    const framework = await getFramework(sourceRecord.get("id"));
    dispatch({
      type: "SET_SOURCE_METADATA",
      sourceId: sourceRecord.get("id"),
      sourceMetaData: {
        framework
      }
    });
  };
}

export function setSymbols(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (
      !sourceRecord ||
      !sourceRecord.get("text") ||
      sourceRecord.get("isWasm") ||
      hasSymbols(getState(), sourceRecord)
    ) {
      return;
    }
    const symbols = await getSymbols(sourceRecord.get("id"));
    dispatch({ type: "SET_SYMBOLS", sourceRecord, symbols });
    dispatch(setEmptyLines(sourceId));
    dispatch(setSourceMetaData(sourceId));
  };
}

export function setEmptyLines(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (
      !sourceRecord ||
      !sourceRecord.get("text") ||
      sourceRecord.get("isWasm")
    ) {
      return;
    }

    const emptyLines = await getEmptyLines(sourceRecord.get("id"));

    dispatch({
      type: "SET_EMPTY_LINES",
      sourceRecord,
      emptyLines
    });
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

    dispatch({
      type: "OUT_OF_SCOPE_LOCATIONS",
      locations
    });

    dispatch(setInScopeLines());
  };
}
