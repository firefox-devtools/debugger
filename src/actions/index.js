// @flow

import * as breakpoints from "./breakpoints";
import * as expressions from "./expressions";
import * as eventListeners from "./event-listeners";
import * as sources from "./sources";
import * as pause from "./pause";
import * as navigation from "./navigation";
import * as ui from "./ui";
import * as fileSearch from "./file-search";
import * as ast from "./ast";
import * as coverage from "./coverage";
import * as projectTextSearch from "./project-text-search";
import * as sourceSearch from "./source-search";
import * as sourceTree from "./source-tree";
import * as loadSourceText from "./sources/loadSourceText";
import * as debuggee from "./debuggee";
import * as toolbox from "./toolbox";

export default Object.assign(
  {},
  navigation,
  breakpoints,
  expressions,
  eventListeners,
  sources,
  pause,
  ui,
  fileSearch,
  ast,
  coverage,
  projectTextSearch,
  sourceSearch,
  sourceTree,
  loadSourceText,
  debuggee,
  toolbox
);
