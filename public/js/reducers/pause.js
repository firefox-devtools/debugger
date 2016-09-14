/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const constants = require("../constants");
const fromJS = require("../utils/fromJS");

const initialState = fromJS({
  pause: null,
  isWaitingOnBreak: false,
  frames: null,
  selectedFrameId: null,
  loadedObjects: {},
  shouldPauseOnExceptions: false,
  shouldIgnoreCaughtExceptions: false,
  expressions: []
});

function update(state = initialState, action, emit) {
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
        return state.merge({ frames });
      }

      break;
    case constants.BREAK_ON_NEXT:
      return state.set("isWaitingOnBreak", true);

    case constants.LOADED_FRAMES:
      if (action.status == "done") {
        return state.set("frames", action.value.frames);
      }

      break;
    case constants.SELECT_FRAME:
      return state.set("selectedFrameId", action.frame.id);

    case constants.LOAD_OBJECT_PROPERTIES:
      if (action.status === "done") {
        const ownProperties = action.value.ownProperties;
        const prototype = action.value.prototype;

        return state.setIn(["loadedObjects", action.objectId],
                           { ownProperties, prototype });
      }
      break;

    case constants.NAVIGATE:
      return initialState;

    case constants.PAUSE_ON_EXCEPTIONS:
      const { shouldPauseOnExceptions, shouldIgnoreCaughtExceptions } = action;
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
      return state.deleteIn(["expressions", action.id]);
  }

  return state;
}

function getPause(state: AppState) {
  return state.pause.get("pause");
}

function getLoadedObjects(state: AppState) {
  return state.pause.get("loadedObjects");
}

function getExpressions(state: AppState) {
  return state.pause.get("expressions");
}

function getIsWaitingOnBreak(state: AppState) {
  return state.pause.get("isWaitingOnBreak");
}

function getShouldPauseOnExceptions(state: AppState) {
  return state.pause.get("shouldPauseOnExceptions");
}

function getShouldIgnoreCaughtExceptions(state: AppState) {
  return state.pause.get("shouldIgnoreCaughtExceptions");
}

function getFrames(state: AppState) {
  return state.pause.get("frames") || [];
}

function getSelectedFrame(state: AppState) {
  const selectedFrameId = state.pause.get("selectedFrameId");
  const frames = state.pause.get("frames");
  return frames && frames.find(frame => frame.id == selectedFrameId);
}

module.exports = {
  initialState,
  update,
  getPause,
  getLoadedObjects,
  getExpressions,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
  getFrames,
  getSelectedFrame
};
