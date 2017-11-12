/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Debuggee reducer
 * @module reducers/debuggee
 */

import { createSelector } from "reselect";
import { List } from "immutable";
import type { Record } from "../utils/makeRecord";
import type { Worker } from "../types";
import type { Action } from "../actions/types";
import makeRecord from "../utils/makeRecord";

type DebuggeeState = {
  workers: List<Worker>
};

export const State = makeRecord(
  ({
    workers: List()
  }: DebuggeeState)
);

export default function debuggee(
  state: Record<DebuggeeState> = State(),
  action: Action
): Record<DebuggeeState> {
  switch (action.type) {
    case "SET_WORKERS":
      return state.set("workers", List(action.workers.workers));
    default:
      return state;
  }
}

const getDebuggeeWrapper = state => state.debuggee;

export const getWorkers = createSelector(getDebuggeeWrapper, debuggeeState =>
  debuggeeState.get("workers")
);
