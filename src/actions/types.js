// @flow

import type {
  Source,
  Breakpoint,
  Expression,
  LoadedObject,
  Location,
  SourceText,
  Frame,
  Why,
} from "../types";

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
  client: any,
};

export type ActionType = Object | Function;

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
  text: string,
};

type BreakpointAction =
  | {
      type: "ADD_BREAKPOINT",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      error: string,
      value: BreakpointResult,
    }
  | {
      type: "REMOVE_BREAKPOINT",
      breakpoint: Breakpoint,
      status: AsyncStatus,
      error: string,
      disabled: boolean,
    }
  | {
      type: "SET_BREAKPOINT_CONDITION",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      value: BreakpointResult,
      error: string,
    }
  | {
      type: "TOGGLE_BREAKPOINTS",
      shouldDisableBreakpoints: boolean,
      status: AsyncStatus,
      error: string,
      value: any,
    };

type SourceAction =
  | { type: "ADD_SOURCE", source: Source }
  | { type: "ADD_SOURCES", sources: Array<Source> }
  | {
      type: "SELECT_SOURCE",
      source: Source,
      line?: number,
      tabIndex?: number,
    }
  | { type: "SELECT_SOURCE_URL", url: string, line?: number }
  | {
      type: "LOAD_SOURCE_TEXT",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: SourceText,
    }
  | {
      type: "BLACKBOX",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: { isBlackBoxed: boolean },
    }
  | {
      type: "TOGGLE_PRETTY_PRINT",
      source: Source,
      originalSource: Source,
      status: AsyncStatus,
      error: string,
      value: {
        isPrettyPrinted: boolean,
        sourceText: SourceText,
        frames: Frame[],
      },
    }
  | { type: "CLOSE_TAB", url: string };

export type panelPositionType = "start" | "end";

type UIAction =
  | {
      type: "TOGGLE_FILE_SEARCH",
      value: boolean,
    }
  | {
      type: "TOGGLE_PROJECT_SEARCH",
      value: boolean,
    }
  | {
      type: "TOGGLE_FILE_SEARCH_MODIFIER",
      modifier: "caseSensitive" | "wholeWord" | "regexMatch",
    }
  | {
      type: "SHOW_SOURCE",
      sourceUrl: string,
    }
  | {
      type: "TOGGLE_PANE",
      position: panelPositionType,
      paneCollapsed: boolean,
    };

type PauseAction =
  | { type: "BREAK_ON_NEXT", value: boolean }
  | { type: "RESUME", value: void }
  | {
      type: "PAUSED",
      pauseInfo: {
        why: Why,
        frame: Frame,
        isInterrupted?: boolean,
      },
      frames: Frame[],
      selectedFrameId: string,
      loadedObjects: LoadedObject[],
    }
  | {
      type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions: boolean,
      shouldIgnoreCaughtExceptions: boolean,
    }
  | { type: "COMMAND", value: void }
  | { type: "SELECT_FRAME", frame: Frame }
  | {
      type: "LOAD_OBJECT_PROPERTIES",
      objectId: string,
      status: string,
      value: Object,
      "@@dispatch/promise": any,
    }
  | {
      type: "ADD_EXPRESSION",
      id: number,
      input: string,
      value: string,
    }
  | {
      type: "EVALUATE_EXPRESSION",
      input: string,
      status: string,
      value: Object,
      "@@dispatch/promise": any,
    }
  | {
      type: "UPDATE_EXPRESSION",
      expression: Expression,
      input: string,
    }
  | {
      type: "DELETE_EXPRESSION",
      input: string,
    };

type NavigateAction = { type: "NAVIGATE", url: string };

/**
 * Actions: Source, Breakpoint, and Navigation
 *
 * @memberof actions/types
 * @static
 */
export type Action =
  | SourceAction
  | BreakpointAction
  | PauseAction
  | NavigateAction
  | UIAction;
