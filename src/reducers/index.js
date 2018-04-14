/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/**
 * Reducer index
 * @module reducers/index
 */

import expressions from "./expressions";
import eventListeners from "./event-listeners";
import sources from "./sources";
import breakpoints from "./breakpoints";
import pendingBreakpoints from "./pending-breakpoints";
import asyncRequests from "./async-requests";
import pause from "./pause";
import ui from "./ui";
import fileSearch from "./file-search";
import ast from "./ast";
import coverage from "./coverage";
import projectTextSearch from "./project-text-search";
import replay from "./replay";
import quickOpen from "./quick-open";
import sourceTree from "./source-tree";
import debuggee from "./debuggee";

export default {
  expressions,
  eventListeners,
  sources,
  breakpoints,
  pendingBreakpoints,
  asyncRequests,
  pause,
  ui,
  fileSearch,
  ast,
  coverage,
  projectTextSearch,
  replay,
  quickOpen,
  sourceTree,
  debuggee
};
