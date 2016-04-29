/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";
const co = require("co");

function asPaused(client, func) {
  if (client.state != "paused") {
    return co(function* () {
      yield client.interrupt();
      let result;

      try {
        result = yield func();
      } catch (e) {
        // Try to put the debugger back in a working state by resuming
        // it
        yield client.resume();
        throw e;
      }

      yield client.resume();
      return result;
    });
  }
  return func();
}

function handleError(err) {
  console.log("ERROR: ", err);
}

function promisify(context, method, ...args) {
  return new Promise((resolve, reject) => {
    args.push(response => {
      if(response.error) {
        reject(response);
      }
      else {
        resolve(response);
      }
    });
    method.apply(context, args);
  });
}

module.exports = {
  asPaused,
  handleError,
  promisify
};
