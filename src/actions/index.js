// @flow

import * as breakpoints from "./breakpoints";
import * as expressions from "./expressions";
import * as eventListeners from "./event-listeners";
import * as sources from "./sources";
import * as pause from "./pause";
import * as navigation from "./navigation";
import * as ui from "./ui";
import * as coverage from "./coverage";

export default Object.assign(
  {},
  navigation,
  breakpoints,
  expressions,
  eventListeners,
  sources,
  pause,
  ui,
  coverage
);
