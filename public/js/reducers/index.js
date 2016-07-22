/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const eventListeners = require("./event-listeners");
const sources = require("./sources");
const breakpoints = require("./breakpoints");
const asyncRequests = require("./async-requests");
const tabs = require("./tabs");
const pause = require("./pause");

module.exports = {
  eventListeners,
  sources: sources.update,
  breakpoints: breakpoints.update,
  asyncRequests,
  tabs,
  pause
};
