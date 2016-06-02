/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const fromJS = require("../util/fromJS");

const initialState = fromJS({
  pause: null,
  isWaitingOnBreak: false,
  frames: null,
  selectedFrame: null,
  loadedObjects: {}
});

function update(state = initialState, action, emit) {
  switch (action.type) {
    case constants.PAUSED:
      const pause = action.pauseInfo;
      pause.isInterrupted = pause.why.type === "interrupted";

      return state.merge({
        isWaitingOnBreak: false,
        pause: fromJS(pause),
        selectedFrame: action.pauseInfo.frame
      });

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
      return state.set("frames", action.frames);

    case constants.SELECT_FRAME:
      return state.set("selectedFrame", action.frame);

    case constants.LOAD_OBJECT_PROPERTIES:
      if (action.status === "done") {
        return state.setIn(
          ["loadedObjects", action.objectId],
          fromJS(action.value.ownProperties).entrySeq()
            .filter(prop => {
              return prop[0] !== "prototype" && prop[1].has("value");
            })
            .sort((a, b) => a[0].localeCompare(b[0]))
            .toArray()
        );
      }
      break;

    case constants.NAVIGATE:
      return initialState;
  }

  return state;
}

module.exports = update;
