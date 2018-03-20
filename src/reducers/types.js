/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow
/**
 * Types reducer
 * @module reducers/types
 */

import type { PauseState } from "./pause";
import type { SourcesState } from "./sources";
import type { BreakpointsState } from "./breakpoints";
import type { ProjectTextSearchState } from "./project-text-search";

export type State = {
  pause: PauseState,
  sources: SourcesState,
  breakpoints: BreakpointsState,
  projectTextSearch: ProjectTextSearchState
};

export type SelectedLocation = {
  sourceId: string,
  line?: number,
  column?: number
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
