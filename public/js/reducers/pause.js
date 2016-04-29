/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const { fromJS } = require("immutable");

const initialState = fromJS({
  pause: null,
  isWaitingOnBreak: false
});

function update(state = initialState, action, emit) {
  switch (action.type) {
    case constants.PAUSED:
      const pause = action.value;
      pause.isInterrupted = pause.why.type == "interrupted";
      if (!pause.isInterrupted) {
        pause.frame.where.actor = pause.frame.where.source.actor;
      }

      return state
        .set("isWaitingOnBreak", false)
        .set("pause", fromJS(pause));
    case constants.RESUME:
      return state.set("pause", null);
    case constants.BREAK_ON_NEXT:
      return state.set("isWaitingOnBreak", true);
  }

  return state;
}

module.exports = update;
