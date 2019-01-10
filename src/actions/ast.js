/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import {
  getGeneratedSource,
  getSource,
  getSourceFromId,
  getSelectedLocation,
  isPaused
} from "../selectors";

import { updateTab } from "./tabs";

import { PROMISE } from "./utils/middleware/promise";

import { setInScopeLines } from "./ast/setInScopeLines";
import { setPausePoints } from "./ast/setPausePoints";
export { setPausePoints };

import * as parser from "../workers/parser";

import { isLoaded, isOriginal } from "../utils/source";

import defer from "./utils/defer";
import type { SourceId } from "../types";
import type { ThunkArgs, Action } from "./types";

const requests = new Map();

export function setSourceMetaData(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const source = getSource(getState(), sourceId);
    if (!source || !isLoaded(source) || source.isWasm) {
      return;
    }

    const framework = await parser.getFramework(source.id);
    if (framework) {
      dispatch(updateTab(source, framework));
    }

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
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    const id = sourceId;
    const source = getSourceFromId(getState(), id);
    // Fetch the source text only once.
    if (requests.has(id)) {
      return requests.get(id);
    }

    if (isLoaded(source)) {
      return Promise.resolve();
    }

    const deferred = defer();
    requests.set(id, deferred.promise);

    try {
      await dispatch({
        type: "SET_SYMBOLS",
        sourceId,
        [PROMISE]: parser.getSymbols(id)
      });
    } catch (e) {
      deferred.resolve();
      requests.delete(id);
      return;
    }

    const newSource = getSourceFromId(getState(), id);
    if (!newSource) {
      return;
    }

    if (isOriginal(newSource) && !newSource.isWasm) {
      const generatedSource = getGeneratedSource(getState(), source);
      await dispatch(setSymbols(generatedSource.id));
    }

    if (!newSource.isWasm) {
      await parser.setSource(newSource);
    }

    // signal that the action is finished
    deferred.resolve();
    requests.delete(id);

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
      locations = await parser.findOutOfScopeLocations(
        source.id,
        ((location: any): parser.AstPosition)
      );
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
