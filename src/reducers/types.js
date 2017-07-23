import type { PauseState } from "./pause";
import type { SourcesState } from "./source";
import type { BreakpointsState } from "./breakpoints";
import type { SearchState } from "./project-text-search";

export type State = {
  pause: PauseState,
  sources: SourcesState,
  breakpoints: BreakpointsState,
  projectTextSearch: ProjectTextSearchState
};

export type { SourceRecord } from "./source";

export type { BreakpointMap } from "./breakpoints";
