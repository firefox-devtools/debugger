/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const constants = require("devtools/client/webconsole/new-console-output/constants");
const Immutable = require("devtools/client/shared/vendor/immutable");

const Ui = Immutable.Record({
  configFilterBarVisible: false,
  filteredMessageVisible: false
});

function ui(state = new Ui(), action) {
  switch (action.type) {
    case constants.FILTERBAR_TOGGLE:
      return state.set("configFilterBarVisible", !state.configFilterBarVisible);
  }

  return state;
}

exports.ui = ui;
