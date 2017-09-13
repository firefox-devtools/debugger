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

export type { SourceRecord, SourcesMap } from "./sources";

export type { BreakpointsMap } from "./breakpoints";
