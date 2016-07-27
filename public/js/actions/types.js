// @flow

export type AsyncStatus = "start" | "done" | "error";

export type Location = {
  sourceId: string,
  line: number,
  column?: number
};

export type Breakpoint = {
  id: string,
  location: Location,
  loading: boolean,
  disabled: boolean,
  text: string,
  condition: ?string
};

export type SourceText = {
  id: string,
  text: string,
  contentType: string
};

export type Source = {
  id: string,
  url?: string,
  sourceMapURL?: string
};

type BreakpointAction =
  { type: "ADD_BREAKPOINT",
    breakpoint: Breakpoint,
    condition: string,
    status: AsyncStatus,
    error: string,
    value: { actualLocation: Location, id: string, text: string } }
  | { type: "REMOVE_BREAKPOINT",
      breakpoint: Breakpoint,
      status: AsyncStatus,
      error: string,
      disabled: boolean }
  | { type: "SET_BREAKPOINT_CONDITION",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      error: string };

type SourceAction =
  { type: "ADD_SOURCE", source: Source }
  | { type: "ADD_SOURCES", sources: Array<Source> }
  | { type: "SELECT_SOURCE", source: Source, options: { position?: number } }
  | { type: "LOAD_SOURCE_TEXT",
      generatedSource: Source,
      originalSources: Array<Source>,
      status: AsyncStatus,
      error: string,
      value: {
        generatedSourceText: SourceText,
        originalSourceTexts: Array<SourceText>
      }}
  | { type: "BLACKBOX",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: { isBlackBoxed: boolean }}
  | { type: "TOGGLE_PRETTY_PRINT",
      source: Source,
      originalSource: Source,
      status: AsyncStatus,
      error: string,
      value: { isPrettyPrinted: boolean,
               sourceText: SourceText }}
  | { type: "CLOSE_TAB", id: string };

export type Action =
  SourceAction
  | BreakpointAction
  | { type: "NAVIGATE" };
