import type { PauseState } from "./pause";
import type { SourcesState } from "./source";
import type { BreakpointsState } from "./breakpoints";

export type State = {
  pause: PauseState,
  sources: SourcesState,
  breakpoints: BreakpointsState
};

export type { SourceRecord } from "./source";

export type { BreakpointMap } from "./breakpoints";
