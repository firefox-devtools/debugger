/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import * as expressions from "./reducers/expressions";
import * as sources from "./reducers/sources";
import * as pause from "./reducers/pause";
import * as debuggee from "./reducers/debuggee";
import * as breakpoints from "./reducers/breakpoints";
import * as pendingBreakpoints from "./reducers/pending-breakpoints";
import * as eventListeners from "./reducers/event-listeners";
import * as ui from "./reducers/ui";
import * as fileSearch from "./reducers/file-search";
import * as ast from "./reducers/ast";
import * as coverage from "./reducers/coverage";
import * as projectTextSearch from "./reducers/project-text-search";
import * as quickOpen from "./reducers/quick-open";
import * as sourceTree from "./reducers/source-tree";

import getBreakpointAtLocation from "./selectors/breakpointAtLocation";
import getVisibleBreakpoints from "./selectors/visibleBreakpoints";
import isSelectedFrameVisible from "./selectors/isSelectedFrameVisible";
import getCallStackFrames from "./selectors/getCallStackFrames";
import getVisibleSelectedFrame from "./selectors/visibleSelectedFrame";

/**
 * @param object - location
 */

module.exports = {
  ...expressions,
  ...sources,
  ...pause,
  ...debuggee,
  ...breakpoints,
  ...pendingBreakpoints,
  ...eventListeners,
  ...ui,
  ...ast,
  ...coverage,
  ...fileSearch,
  ...projectTextSearch,
  ...quickOpen,
  ...sourceTree,
  getBreakpointAtLocation,
  getVisibleBreakpoints,
  isSelectedFrameVisible,
  getCallStackFrames,
  getVisibleSelectedFrame
};
