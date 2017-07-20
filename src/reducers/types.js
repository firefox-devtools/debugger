import type { PauseState } from "./pause";
import type { SourcesState } from "./sources";
import type { BreakpointsState } from "./breakpoints";

export type State = {
  pause: PauseState,
  sources: SourcesState,
  breakpoints: BreakpointsState
};

export type { SourceRecord, SourcesMap } from "./sources";

export type { BreakpointMap } from "./breakpoints";
