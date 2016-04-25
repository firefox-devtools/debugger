/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("../constants");
const { fromJS } = require("immutable");

const initialState = fromJS({
  pause: null,
  breakOnNext: false
});

function update(state = initialState, action, emit) {
  switch (action.type) {
    case constants.PAUSED:
      return state.set("pause", fromJS(action.value));
    case constants.RESUME:
      return state.set("pause", null);
    case constants.BREAK_ON_NEXT:
      return state.set("breakOnNext", true);
  }

  return state;
}

module.exports = update;
