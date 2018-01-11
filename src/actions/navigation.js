/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { clearDocuments } from "../utils/editor";
import sourceQueue from "../utils/source-queue";
import { getSources } from "../reducers/sources";
import { waitForMs } from "../utils/utils";

import { newSources } from "./sources";
import { updateWorkers } from "./debuggee";

import {
  clearASTs,
  clearSymbols,
  clearScopes,
  clearSources
} from "../workers/parser";

import { clearWasmStates } from "../utils/wasm";

import type { ThunkArgs } from "./types";

/**
 * Redux actions for the navigation state
 * @module actions/navigation
 */

/**
 * @memberof actions/navigation
 * @static
 */
export function willNavigate(_: any, event: Object) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    await sourceMaps.clearSourceMaps();
    clearWasmStates();
    clearDocuments();
    clearSymbols();
    clearASTs();
    clearScopes();
    clearSources();
    dispatch(navigate(event.url));
  };
}

export function navigate(url: string) {
  sourceQueue.clear();

  return {
    type: "NAVIGATE",
    url
  };
}

export function connect(url: string) {
  return async function({ dispatch }: ThunkArgs) {
    await dispatch(updateWorkers());
    dispatch({ type: "CONNECT", url });
  };
}

/**
 * @memberof actions/navigation
 * @static
 */
export function navigated() {
  return async function({ dispatch, getState, client }: ThunkArgs) {
    await waitForMs(100);
    if (getSources(getState()).size == 0) {
      const sources = await client.fetchSources();
      dispatch(newSources(sources));
    }
  };
}
