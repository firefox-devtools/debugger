// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const constants = require("../constants");
const fromJS = require("../utils/fromJS");
const makeRecord = require("../utils/makeRecord");
const { prefs } = require("../utils/prefs");
const I = require("immutable");

import type { Frame, Pause, Expression } from "../types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type PauseState = {
  pause: ?Pause,
  isWaitingOnBreak: boolean,
  frames: ?Frame[],
  selectedFrameId: ?string,
  loadedObjects: Object,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean,
  expressions: I.List<Expression>
}

const State = makeRecord(({
  pause: undefined,
  isWaitingOnBreak: false,
  frames: undefined,
  selectedFrameId: undefined,
  loadedObjects: I.Map(),
  shouldPauseOnExceptions: prefs.pauseOnExceptions,
  shouldIgnoreCaughtExceptions: prefs.ignoreCaughtExceptions,
  expressions: I.List()
} : PauseState));

function update(state = State(), action: Action): Record<PauseState> {
  switch (action.type) {
    case constants.PAUSED: {
      const { selectedFrameId, frames, pauseInfo } = action;
      pauseInfo.isInterrupted = pauseInfo.why.type === "interrupted";

      return state.merge({
        isWaitingOnBreak: false,
        pause: fromJS(pauseInfo),
        selectedFrameId,
        frames
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
      if (action.status === "done") {
        if (!action.value) {
          return state;
        }

        const ownProperties = action.value.ownProperties;
        const prototype = action.value.prototype;

        return state.setIn(["loadedObjects", action.objectId],
                           { ownProperties, prototype });
      }
      break;

    case constants.NAVIGATE:
      return State();

    case constants.PAUSE_ON_EXCEPTIONS:
      const { shouldPauseOnExceptions, shouldIgnoreCaughtExceptions } = action;

      prefs.pauseOnExceptions = shouldPauseOnExceptions;
      prefs.ignoreCaughtExceptions = shouldIgnoreCaughtExceptions;

      return state.merge({
        shouldPauseOnExceptions,
        shouldIgnoreCaughtExceptions
      });

    case constants.ADD_EXPRESSION:
      return state.setIn(["expressions", action.id],
        { id: action.id,
          input: action.input,
          value: action.value,
          updating: false });

    case constants.EVALUATE_EXPRESSION:
      if (action.status === "done") {
        return state.mergeIn(["expressions", action.id],
          { id: action.id,
            input: action.input,
            value: action.value,
            updating: false });
      }
      break;

    case constants.UPDATE_EXPRESSION:
      return state.mergeIn(["expressions", action.id],
        { id: action.id,
          input: action.input,
          updating: true });

    case constants.DELETE_EXPRESSION:
      return deleteExpression(state, action.id);
  }

  return state;
}

function deleteExpression(state, id) {
  const index = getExpressions({ pause: state }).findKey(e => e.id == id);
  return state.deleteIn(["expressions", index]);
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

function getPause(state: OuterState) {
  return state.pause.get("pause");
}

function getLoadedObjects(state: OuterState) {
  return state.pause.get("loadedObjects");
}

function getExpressions(state: OuterState) {
  return state.pause.get("expressions");
}

function getIsWaitingOnBreak(state: OuterState) {
  return state.pause.get("isWaitingOnBreak");
}

function getShouldPauseOnExceptions(state: OuterState) {
  return state.pause.get("shouldPauseOnExceptions");
}

function getShouldIgnoreCaughtExceptions(state: OuterState) {
  return state.pause.get("shouldIgnoreCaughtExceptions");
}

function getFrames(state: OuterState) {
  return state.pause.get("frames");
}

function getSelectedFrame(state: OuterState) {
  const selectedFrameId = state.pause.get("selectedFrameId");
  const frames = state.pause.get("frames");
  return frames && frames.find(frame => frame.id == selectedFrameId);
}

// NOTE: currently only used for chrome
function getChromeScopes(state: OuterState) {
  const frame = getSelectedFrame(state);
  return frame ? frame.scopeChain : undefined;
}

module.exports = {
  State,
  update,
  getPause,
  getChromeScopes,
  getLoadedObjects,
  getExpressions,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
  getFrames,
  getSelectedFrame
};
