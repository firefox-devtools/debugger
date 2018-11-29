/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import * as breakpoints from "./breakpoints";
import * as expressions from "./expressions";
import * as pause from "./pause";
import * as navigation from "./navigation";
import * as ui from "./ui";
import * as fileSearch from "./file-search";
import * as ast from "./ast";
import * as projectTextSearch from "./project-text-search";
import * as quickOpen from "./quick-open";
import * as sourceTree from "./source-tree";
import * as sources from "./sources";
import * as tabs from "./tabs";
import * as debuggee from "./debuggee";
import * as toolbox from "./toolbox";
import * as preview from "./preview";

export default {
  ...navigation,
  ...breakpoints,
  ...expressions,
  ...sources,
  ...tabs,
  ...pause,
  ...ui,
  ...fileSearch,
  ...ast,
  ...projectTextSearch,
  ...quickOpen,
  ...sourceTree,
  ...debuggee,
  ...toolbox,
  ...preview
};
