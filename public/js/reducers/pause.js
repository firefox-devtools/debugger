/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const constants = require("../constants");
const fromJS = require("../utils/fromJS");

const initialState = fromJS({
  pause: null,
  isWaitingOnBreak: false,
  frames: null,
  selectedFrame: null,
  loadedObjects: {},
  shouldPauseOnExceptions: false,
  expressions: []
});

function update(state = initialState, action, emit) {
  switch (action.type) {
    case constants.PAUSED:
      if (action.status == "done") {
        const pause = action.value.pauseInfo;
        pause.isInterrupted = pause.why.type === "interrupted";

        return state.merge({
          isWaitingOnBreak: false,
          pause: fromJS(pause),
          selectedFrame: action.value.pauseInfo.frame,
          frames: action.value.frames
        });
      }

      break;
    case constants.RESUME:
      return state.merge({
        pause: null,
        frames: null,
        selectedFrame: null,
        loadedObjects: {}
      });

    case constants.BREAK_ON_NEXT:
      return state.set("isWaitingOnBreak", true);

    case constants.LOADED_FRAMES:
      if (action.status == "done") {
        return state.set("frames", action.value.frames);
      }

      break;
    case constants.SELECT_FRAME:
      return state.set("selectedFrame", action.frame);

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
      const toggle = action.toggle;
      return state.set("shouldPauseOnExceptions", toggle);

    case constants.ADD_EXPRESSION:
      return state.setIn(["expressions", action.id],
        { id: action.id,
          expression: action.expression,
          value: action.value || null });

    case constants.EVALUATE_EXPRESSION:
      if (action.status === "done") {
        console.log(action.value);
        return state.setIn(["expressions", action.id],
          { id: action.id,
            expression: action.expression,
            value: action.value });
      }
      break;
  }

  return state;
}

module.exports = update;
