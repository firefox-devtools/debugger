// @flow
import * as expressions from "./reducers/expressions";
import * as sources from "./reducers/sources";
import * as pause from "./reducers/pause";
import * as breakpoints from "./reducers/breakpoints";
import * as eventListeners from "./reducers/event-listeners";
import * as ui from "./reducers/ui";
import * as ast from "./reducers/ast";
import * as coverage from "./reducers/coverage";
import * as search from "./reducers/project-text-search";

import getBreakpointAtLocation from "./selectors/breakpointAtLocation";
import getInScopeLines from "./selectors/linesInScope";
import getVisibleBreakpoints from "./selectors/visibleBreakpoints";

/**
 * @param object - location
 */

module.exports = Object.assign(
  {},
  expressions,
  sources,
  pause,
  breakpoints,
  eventListeners,
  ui,
  ast,
  coverage,
  search,
  { getBreakpointAtLocation, getInScopeLines, getVisibleBreakpoints }
);
