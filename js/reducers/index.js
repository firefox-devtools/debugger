/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const eventListeners = require('./event-listeners');
const sources = require('./sources');
const breakpoints = require('./breakpoints');
const asyncRequests = require('./async-requests');
const tabs = require('./tabs');

module.exports = {
  eventListeners,
  sources,
  breakpoints,
  asyncRequests,
  tabs
};
