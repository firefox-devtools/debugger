// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fromJS from "../utils/fromJS";
import makeRecord from "../utils/makeRecord";
import { prefs } from "../utils/prefs";
import * as I from "immutable";

import constants from "../constants";
import type { Frame, Pause } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type PauseState = {
  pause: ?Pause,
  isWaitingOnBreak: boolean,
  frames: ?(Frame[]),
  selectedFrameId: ?string,
  loadedObjects: Object,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean,
  debuggeeUrl: string
};

export const State = makeRecord(
  ({
    pause: undefined,
    isWaitingOnBreak: false,
    frames: undefined,
    selectedFrameId: undefined,
    loadedObjects: I.Map(),
    shouldPauseOnExceptions: prefs.pauseOnExceptions,
    shouldIgnoreCaughtExceptions: prefs.ignoreCaughtExceptions,
    debuggeeUrl: ""
  }: PauseState)
);

function update(
  state: Record<PauseState> = State(),
  action: Action
): Record<PauseState> {
  switch (action.type) {
    case constants.PAUSED: {
      const { selectedFrameId, frames, loadedObjects, pauseInfo } = action;
      pauseInfo.isInterrupted = pauseInfo.why.type === "interrupted";

      // turn this into an object keyed by object id
      let objectMap = {};
      loadedObjects.forEach(obj => {
        objectMap[obj.value.objectId] = obj;
      });

      return state.merge({
        isWaitingOnBreak: false,
        pause: fromJS(pauseInfo),
        selectedFrameId,
        frames,
        loadedObjects: objectMap
      });
    }

    case constants.RESUME:
      return state.merge({
        pause: null,
        frames: null,
        selectedFrameId: null,
        loadedObjects: {}
      });

    case constants.TOGGLE_PRETTY_PRINT:
      if (action.status == "done") {
        const frames = action.value.frames;
        let pause = state.get("pause");
        if (pause) {
          pause = pause.set("frame", fromJS(frames[0]));
        }

        return state.merge({ pause, frames });
      }

      break;
    case constants.BREAK_ON_NEXT:
      return state.set("isWaitingOnBreak", true);

    case constants.SELECT_FRAME:
      return state.set("selectedFrameId", action.frame.id);

    case constants.LOAD_OBJECT_PROPERTIES:
      if (action.status === "start") {
        return state.setIn(["loadedObjects", action.objectId], {});
      }

      if (action.status === "done") {
        if (!action.value) {
          return state;
        }

        const ownProperties = action.value.ownProperties;
        const ownSymbols = action.value.ownSymbols || [];
        const prototype = action.value.prototype;

        return state.setIn(["loadedObjects", action.objectId], {
          ownProperties,
          prototype,
          ownSymbols
        });
      }
      break;

    case constants.NAVIGATE:
      return State().set("debuggeeUrl", action.url);

    case constants.PAUSE_ON_EXCEPTIONS:
      const { shouldPauseOnExceptions, shouldIgnoreCaughtExceptions } = action;

      prefs.pauseOnExceptions = shouldPauseOnExceptions;
      prefs.ignoreCaughtExceptions = shouldIgnoreCaughtExceptions;

      return state.merge({
        shouldPauseOnExceptions,
        shouldIgnoreCaughtExceptions
      });
  }

  return state;
}

// Selectors

// Unfortunately, it's really hard to make these functions accept just
// the state that we care about and still type it with Flow. The
// problem is that we want to re-export all selectors from a single
// module for the UI, and all of those selectors should take the
// top-level app state, so we'd have to "wrap" them to automatically
// pick off the piece of state we're interested in. It's impossible
// (right now) to type those wrapped functions.
type OuterState = { pause: Record<PauseState> };

export function getPause(state: OuterState) {
  return state.pause.get("pause");
}

export function getLoadedObjects(state: OuterState) {
  return state.pause.get("loadedObjects");
}

export function getLoadedObject(state: OuterState, objectId: string) {
  return getLoadedObjects(state).get(objectId);
}

export function getObjectProperties(state: OuterState, parentId: string) {
  return getLoadedObjects(state).filter(obj => obj.get("parentId") == parentId);
}

export function getIsWaitingOnBreak(state: OuterState) {
  return state.pause.get("isWaitingOnBreak");
}

export function getShouldPauseOnExceptions(state: OuterState) {
  return state.pause.get("shouldPauseOnExceptions");
}

export function getShouldIgnoreCaughtExceptions(state: OuterState) {
  return state.pause.get("shouldIgnoreCaughtExceptions");
}

export function getFrames(state: OuterState) {
  return state.pause.get("frames");
}

export function getSelectedFrame(state: OuterState) {
  const selectedFrameId = state.pause.get("selectedFrameId");
  const frames = state.pause.get("frames");
  if (!frames) {
    return null;
  }

  return frames.find(frame => frame.get("id") == selectedFrameId).toJS();
}

export function getDebuggeeUrl(state: OuterState) {
  return state.pause.get("debuggeeUrl");
}

// NOTE: currently only used for chrome
export function getChromeScopes(state: OuterState) {
  const frame = getSelectedFrame(state);
  return frame ? frame.scopeChain : undefined;
}

export default update;
