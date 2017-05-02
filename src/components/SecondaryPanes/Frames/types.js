import type { Frame } from "debugger-html";

export type LocalFrame = Frame & {
  library: string,
  source: Source
};
