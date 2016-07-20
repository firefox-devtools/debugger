/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const Immutable = require("devtools/client/shared/vendor/immutable");
const constants = require("devtools/client/webconsole/new-console-output/constants");

function messages(state = Immutable.List(), action) {
  switch (action.type) {
    case constants.MESSAGE_ADD:
      let newMessage = action.message;

      if (newMessage.type === "clear") {
        return Immutable.List([newMessage]);
      }

      if (newMessage.allowRepeating && state.size > 0) {
        let lastMessage = state.last();
        if (lastMessage.repeatId === newMessage.repeatId) {
          return state.pop().push(
            newMessage.set("repeat", lastMessage.repeat + 1)
          );
        }
      }
      return state.push(newMessage);
    case constants.MESSAGES_CLEAR:
      return Immutable.List();
  }

  return state;
}

exports.messages = messages;
