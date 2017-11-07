/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
/* eslint complexity: ["error", 30]*/

/**
 * Pause reducer
 * @module reducers/pause
 */

import { createSelector } from "reselect";
import { prefs } from "../utils/prefs";
import { isEmpty } from "lodash";

import type { Action } from "../actions/types";
import type { Why } from "debugger-html";

type PauseState = {
  pause: ?any,
  why: ?Why,
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
  why: null,
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

const emptyPauseState = {
  pause: null,
  frames: null,
  frameScopes: {},
  selectedFrameId: null,
  loadedObjects: {}
};

function update(state: PauseState = State(), action: Action): PauseState {
  switch (action.type) {
    case "PAUSED": {
      const { selectedFrameId, frames, loadedObjects, pauseInfo } = action;

      const { why } = pauseInfo;
      pauseInfo.isInterrupted = pauseInfo.why.type === "interrupted";

      // turn this into an object keyed by object id
      const objectMap = {};
      loadedObjects.forEach(obj => {
        objectMap[obj.value.objectId] = obj;
      });

      return {
        ...state,
        isWaitingOnBreak: false,
        pause: pauseInfo,
        selectedFrameId,
        frames,
        frameScopes: {},
        loadedObjects: objectMap,
        why
      };
    }

    case "ADD_SCOPES":
    case "MAP_SCOPES":
      const { frame, scopes } = action;
      const selectedFrameId = frame.id;
      const frameScopes = { ...state.frameScopes, [selectedFrameId]: scopes };
      return { ...state, frameScopes };

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
      return {
        ...state,
        selectedFrameId: action.frame.id
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
      return action.status === "start"
        ? { ...state, ...emptyPauseState, command: action.command }
        : { ...state, command: "" };

    case "RESUME":
      // We clear why on resume because we need it to decide if
      // we shoul re-evaluate watch expressions.
      return { ...state, why: null };

    case "EVALUATE_EXPRESSION":
      return {
        ...state,
        command: action.status === "start" ? "expression" : ""
      };

    case "NAVIGATE":
      return { ...state, ...emptyPauseState, debuggeeUrl: action.url };
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

export function getPauseReason(state: OuterState): ?Why {
  return state.pause.why;
}

export function isStepping(state: OuterState) {
  return ["stepIn", "stepOver", "stepOut"].includes(state.pause.command);
}

export function isPaused(state: OuterState) {
  return !!getPause(state);
}

export function isEvaluatingExpression(state: OuterState) {
  return state.pause.command === "expression";
}

export function getLoadedObject(state: OuterState, objectId: string) {
  return getLoadedObjects(state)[objectId];
}

export function hasLoadingObjects(state: OuterState) {
  const objects = getLoadedObjects(state);
  return Object.values(objects).some(isEmpty);
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

export function getFrameScope(state: OuterState, frameId: ?string) {
  if (!frameId) {
    return null;
  }

  return state.pause.frameScopes[frameId];
}

export function getSelectedScope(state: OuterState) {
  const frameId = getSelectedFrameId(state);
  return getFrameScope(state, frameId);
}

export function getScopes(state: OuterState) {
  const selectedFrameId = getSelectedFrameId(state);
  return state.pause.frameScopes[selectedFrameId];
}

export function getSelectedFrameId(state: OuterState) {
  return state.pause.selectedFrameId;
}

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
