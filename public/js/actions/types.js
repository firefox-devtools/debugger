// @flow

/**
 * Flow types
 * @module actions/types
 */

/**
 * Tri-state status for async operations
 *
 * Available options are:
 * `"start"` or `"done"` or `"error"`
 *
 * @memberof actions/types
 * @static
 * @enum
 */
export type AsyncStatus = "start" | "done" | "error";

/**
 * Source File Location
 *
 * @memberof actions/types
 * @static
 */
export type Location = {
  sourceId: string,
  line: number,
  column?: number
};

/**
 * Breakpoint
 *
 * @memberof actions/types
 * @static
 */
export type Breakpoint = {
  id: string,
  location: Location,
  loading: boolean,
  disabled: boolean,
  text: string,
  condition: ?string
};

/**
 * Source Text
 *
 * @memberof actions/types
 * @static
 */
export type SourceText = {
  id: string,
  text: string,
  contentType: string
};

/**
 * Source URL
 *
 * @memberof actions/types
 * @static
 */
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
  | { type: "SELECT_SOURCE", source: Source,
      line?: number,
      tabIndex?: number }
  | { type: "SELECT_SOURCE_URL", url: string, line?: number }
  | { type: "LOAD_SOURCE_TEXT",
      source: Source,
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

/**
 * Actions: Source, Breakpoint, and Navigation
 *
 * @memberof actions/types
 * @static
 */
export type Action =
  SourceAction
  | BreakpointAction
  | { type: "NAVIGATE" };
