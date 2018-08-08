/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/**
 * Types reducer
 * @module reducers/types
 */

// @flow

import type { ASTState } from "./ast";
import type { BreakpointsState } from "./breakpoints";
import type { ExpressionState } from "./expressions";
import type { FileSearchState } from "./file-search";
import type { PauseState } from "./pause";
import type { PendingBreakpointsState } from "../selectors";
import type { ProjectTextSearchState } from "./project-text-search";
import type { Record } from "../utils/makeRecord";
import type { SourcesState } from "./sources";
import type { TabList } from "./tabs";
import type { UIState } from "./ui";

export type State = {
  ast: Record<ASTState>,
  breakpoints: Record<BreakpointsState>,
  expressions: Record<ExpressionState>,
  fileSearch: Record<FileSearchState>,
  pause: PauseState,
  pendingBreakpoints: PendingBreakpointsState,
  projectTextSearch: Record<ProjectTextSearchState>,
  sources: SourcesState,
  tabs: TabList,
  ui: Record<UIState>
};

export type PendingSelectedLocation = {
  url: string,
  line?: number,
  column?: number
};

export type { SourcesMap } from "./sources";
export type { ActiveSearchType, OrientationType } from "./ui";
export type { BreakpointsMap } from "./breakpoints";
export type { WorkersList } from "./debuggee";
export type { Command } from "./pause";
export type { SourceMetaDataMap } from "./ast";
