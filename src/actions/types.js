// @flow

import type { Source,
              Breakpoint,
              Location,
              SourceText,
              Frame,
              Why } from "../types";

/**
 * Flow types
 * @module actions/types
 */

/**
  * Argument parameters via Thunk middleware for {@link https://github.com/gaearon/redux-thunk|Redux Thunk}
  *
  * @memberof actions/breakpoints
  * @static
  * @typedef {Object} ThunkArgs
  */
export type ThunkArgs = {
  dispatch: () => Promise<any>,
  getState: () => any,
  client: any
};

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

type BreakpointResult = {
  actualLocation: Location,
  id: string,
  text: string
}

type BreakpointAction =
  { type: "ADD_BREAKPOINT",
    breakpoint: Breakpoint,
    condition: string,
    status: AsyncStatus,
    error: string,
    value: BreakpointResult}
  | { type: "REMOVE_BREAKPOINT",
      breakpoint: Breakpoint,
      status: AsyncStatus,
      error: string,
      disabled: boolean }
  | { type: "SET_BREAKPOINT_CONDITION",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      value: BreakpointResult,
      error: string }
  | { type: "TOGGLE_BREAKPOINTS",
      shouldDisableBreakpoints: boolean,
      status: AsyncStatus,
      error: string,
      value: any };

type SourceAction =
  { type: "ADD_SOURCE", source: Source }
  | { type: "SELECT_SOURCE", source: Source,
      line?: number,
      tabIndex?: number }
  | { type: "SELECT_SOURCE_URL", url: string, line?: number }
  | { type: "LOAD_SOURCE_TEXT",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: SourceText }
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

type UIAction = { type: "TOGGLE_FILE_SEARCH", searchOn: boolean };

type PauseAction =
  { type: "BREAK_ON_NEXT", value: boolean }
  | { type: "RESUME", value: void }
  | { type: "PAUSED",
      pauseInfo: { why: Why,
                  frame: Frame,
                  isInterrupted?: boolean },
      frames: Frame[],
      selectedFrameId: string,
      }
  | { type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions: boolean,
      shouldIgnoreCaughtExceptions: boolean }
  | { type: "COMMAND", value: void }
  | { type: "SELECT_FRAME", frame: Frame }
  | { type: "LOAD_OBJECT_PROPERTIES",
      objectId: any,
      "@@dispatch/promise": any }
  | { type: "ADD_EXPRESSION",
      id: number,
      input: any }
  | { type: "EVALUATE_EXPRESSION",
      id: number,
      input: any,
      "@@dispatch/promise": any }
  | { type: "UPDATE_EXPRESSION",
      id: number,
      inpud: any }
  | { type: "DELETE_EXPRESSION",
      id: number };

/**
 * Actions: Source, Breakpoint, and Navigation
 *
 * @memberof actions/types
 * @static
 */
export type Action =
  SourceAction
  | BreakpointAction
  | PauseAction
  | { type: "NAVIGATE" }
  | UIAction;
