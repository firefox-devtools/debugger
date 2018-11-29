/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export * from "../reducers/expressions";
export * from "../reducers/sources";
export * from "../reducers/tabs";
export * from "../reducers/pause";
export * from "../reducers/debuggee";
export * from "../reducers/breakpoints";
export * from "../reducers/pending-breakpoints";
export * from "../reducers/ui";
export * from "../reducers/file-search";
export * from "../reducers/ast";
export * from "../reducers/project-text-search";
export * from "../reducers/source-tree";

export {
  getQuickOpenEnabled,
  getQuickOpenQuery,
  getQuickOpenType
} from "../reducers/quick-open";

export {
  getBreakpointAtLocation,
  getBreakpointsAtLine
} from "./breakpointAtLocation";
export { getVisibleBreakpoints } from "./visibleBreakpoints";
export { inComponent } from "./inComponent";
export { isSelectedFrameVisible } from "./isSelectedFrameVisible";
export { getCallStackFrames } from "./getCallStackFrames";
export { getVisibleSelectedFrame } from "./visibleSelectedFrame";
export { getBreakpointSources } from "./breakpointSources";
export { getXHRBreakpoints, shouldPauseOnAnyXHR } from "./breakpoints";
export { visibleColumnBreakpoints } from "./visibleColumnBreakpoints";
export { getVisiblePausePoints } from "./visiblePausePoints";

import { objectInspector } from "devtools-reps";

const { reducer } = objectInspector;

Object.keys(reducer).forEach(function(key) {
  if (key === "default" || key === "__esModule") {
    return;
  }
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: reducer[key]
  });
});
