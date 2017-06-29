// @flow
import * as expressions from "./reducers/expressions";
import * as sources from "./reducers/sources";
import * as pause from "./reducers/pause";
import * as breakpoints from "./reducers/breakpoints";
import * as eventListeners from "./reducers/event-listeners";
import * as ui from "./reducers/ui";
import * as ast from "./reducers/ast";
import * as coverage from "./reducers/coverage";

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
  coverage
);
