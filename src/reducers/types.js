import type { PauseState } from "pause";
import type { SourcesState } from "source";
import type { BreakpointsState } from "breakpoints";

export type State = {
  pause: PauseState,
  sources: SourcesState,
  breakpoints: BreakpointsState
};
