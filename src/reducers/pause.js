// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";

import type { Action } from "../actions/types";

type PauseState = {
  pause: ?any,
  isWaitingOnBreak: boolean,
  frames: ?(any[]),
  frameScopes: any,
  selectedFrameId: ?string,
  loadedObjects: Object,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean,
  debuggeeUrl: string,
  command: string
};

export const State = (): PauseState => ({
  pause: undefined,
  isWaitingOnBreak: false,
  frames: undefined,
  selectedFrameId: undefined,
  frameScopes: {},
  loadedObjects: {},
  shouldPauseOnExceptions: prefs.pauseOnExceptions,
  shouldIgnoreCaughtExceptions: prefs.ignoreCaughtExceptions,
  debuggeeUrl: "",
  command: ""
});

function update(state: PauseState = State(), action: Action): PauseState {
  switch (action.type) {
    case "PAUSED": {
      const {
        selectedFrameId,
        frames,
        scopes,
        loadedObjects,
        pauseInfo
      } = action;
      pauseInfo.isInterrupted = pauseInfo.why.type === "interrupted";

      const frameScopes = { [selectedFrameId]: scopes };

      // turn this into an object keyed by object id
      const objectMap = {};
      loadedObjects.forEach(obj => {
        objectMap[obj.value.objectId] = obj;
      });

      return Object.assign({}, state, {
        isWaitingOnBreak: false,
        pause: pauseInfo,
        selectedFrameId,
        frames,
        frameScopes,
        loadedObjects: objectMap
      });
    }

    case "RESUME":
      return Object.assign({}, state, {
        pause: null,
        frames: null,
        selectedFrameId: null,
        loadedObjects: {}
      });

    case "TOGGLE_PRETTY_PRINT":
      if (action.status == "done") {
        const frames = action.value.frames;
        const pause = state.pause;
        if (pause) {
          pause.frame = frames[0];
        }

        return Object.assign({}, state, { pause, frames });
      }

      break;
    case "BREAK_ON_NEXT":
      return Object.assign({}, state, { isWaitingOnBreak: true });

    case "SELECT_FRAME":
      const { frame, scopes } = action;
      const selectedFrameId = frame.id;
      return {
        ...state,
        frameScopes: { ...state.frameScopes, [selectedFrameId]: scopes },
        selectedFrameId
      };

    case "LOAD_OBJECT_PROPERTIES":
      if (action.status === "start") {
        return {
          ...state,
          loadedObjects: {
            ...state.loadedObjects,
            [action.objectId]: {}
          }
        };
      }

      if (action.status === "done") {
        if (!action.value) {
          return Object.assign({}, state);
        }

        const ownProperties = action.value.ownProperties;
        const ownSymbols = action.value.ownSymbols || [];
        const prototype = action.value.prototype;

        return {
          ...state,
          loadedObjects: {
            ...state.loadedObjects,
            [action.objectId]: { ownProperties, prototype, ownSymbols }
          }
        };
      }
      break;

    case "CONNECT":
      return Object.assign({}, State(), { debuggeeUrl: action.url });

    case "PAUSE_ON_EXCEPTIONS":
      const { shouldPauseOnExceptions, shouldIgnoreCaughtExceptions } = action;

      prefs.pauseOnExceptions = shouldPauseOnExceptions;
      prefs.ignoreCaughtExceptions = shouldIgnoreCaughtExceptions;

      return Object.assign({}, state, {
        shouldPauseOnExceptions,
        shouldIgnoreCaughtExceptions
      });

    case "COMMAND":
      return { ...state, command: action.value.type };

    case "CLEAR_COMMAND":
      return { ...state, command: "" };

    case "EVALUATE_EXPRESSION":
      return {
        ...state,
        command: action.status === "start" ? "expression" : ""
      };

    case "NAVIGATE":
      return { ...state, debuggeeUrl: action.url };
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
type OuterState = { pause: PauseState };

const getPauseState = state => state.pause;

export const getPause = createSelector(
  getPauseState,
  pauseWrapper => pauseWrapper.pause
);

export const getLoadedObjects = createSelector(
  getPauseState,
  pauseWrapper => pauseWrapper.loadedObjects
);

export function isStepping(state: OuterState) {
  return ["stepIn", "stepOver", "stepOut"].includes(state.pause.command);
}

export function isPaused(state: OuterState) {
  return !!getPause(state);
}

export function isEvaluatingExpression(state: OuterState) {
  return state.pause.command === "expression";
}

export function pausedInEval(state: OuterState) {
  if (!state.pause.pause) {
    return false;
  }

  const exception = state.pause.pause.why.exception;
  if (!exception) {
    return false;
  }

  return exception.preview.fileName === "debugger eval code";
}

export function getLoadedObject(state: OuterState, objectId: string) {
  return getLoadedObjects(state)[objectId];
}

export function getObjectProperties(state: OuterState, parentId: string) {
  return getLoadedObjects(state).filter(obj => obj.parentId == parentId);
}

export function getIsWaitingOnBreak(state: OuterState) {
  return state.pause.isWaitingOnBreak;
}

export function getShouldPauseOnExceptions(state: OuterState) {
  return state.pause.shouldPauseOnExceptions;
}

export function getShouldIgnoreCaughtExceptions(state: OuterState) {
  return state.pause.shouldIgnoreCaughtExceptions;
}

export function getFrames(state: OuterState) {
  return state.pause.frames;
}

export function getFrameScopes(state: OuterState, frameId: string) {
  return state.pause.frameScopes[frameId];
}

export const getSelectedFrameId = createSelector(
  getPauseState,
  pauseWrapper => {
    return pauseWrapper.selectedFrameId;
  }
);

export const getSelectedFrame = createSelector(
  getSelectedFrameId,
  getFrames,
  (selectedFrameId, frames) => {
    if (!frames) {
      return null;
    }
    return frames.find(frame => frame.id == selectedFrameId);
  }
);

export function getDebuggeeUrl(state: OuterState) {
  return state.pause.debuggeeUrl;
}

// NOTE: currently only used for chrome
export function getChromeScopes(state: OuterState) {
  const frame = getSelectedFrame(state);
  return frame ? frame.scopeChain : undefined;
}

export default update;
