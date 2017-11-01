// @flow

import type {
  Source,
  Breakpoint,
  Expression,
  LoadedObject,
  Location,
  Frame,
  Scope,
  Why
} from "debugger-html";

import type { State } from "../reducers/types";
import type { ActiveSearchType } from "../reducers/ui";
import type { MatchedLocations } from "../reducers/file-search";

import type { SymbolDeclaration, AstLocation } from "../workers/parser";

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
  dispatch: (action: any) => Promise<any>,
  getState: () => State,
  client: any,
  sourceMaps: any,
  openLink: (url: string) => void
};

export type Thunk = ThunkArgs => any;

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
  generatedLocation: Location
};

type AddBreakpointResult = {
  previousLocation: Location,
  breakpoint: Breakpoint
};

type ProjectTextSearchResult = {
  sourceId: string,
  filepath: string,
  matches: MatchedLocations[]
};

type BreakpointAction =
  | {
      type: "ADD_BREAKPOINT",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      error: string,
      value: AddBreakpointResult
    }
  | {
      type: "REMOVE_BREAKPOINT",
      breakpoint: Breakpoint,
      status: AsyncStatus,
      error: string,
      disabled: boolean
    }
  | {
      type: "SET_BREAKPOINT_CONDITION",
      breakpoint: Breakpoint,
      condition: string,
      status: AsyncStatus,
      value: BreakpointResult,
      error: string
    }
  | {
      type: "TOGGLE_BREAKPOINTS",
      shouldDisableBreakpoints: boolean,
      status: AsyncStatus,
      error: string,
      value: any
    };

type SourceAction =
  | { type: "ADD_SOURCE", source: Source }
  | { type: "ADD_SOURCES", sources: Array<Source> }
  | {
      type: "SELECT_SOURCE",
      source: Source,
      location?: { line?: number, column?: number },
      tabIndex?: number
    }
  | { type: "SELECT_SOURCE_URL", url: string, line?: number }
  | {
      type: "LOAD_SOURCE_TEXT",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: Source
    }
  | {
      type: "BLACKBOX",
      source: Source,
      error: string,
      value: { isBlackBoxed: boolean }
    }
  | {
      type: "TOGGLE_PRETTY_PRINT",
      source: Source,
      originalSource: Source,
      status: AsyncStatus,
      error: string,
      value: {
        isPrettyPrinted: boolean,
        source: Source,
        frames: Frame[]
      }
    }
  | { type: "MOVE_TAB", url: string, tabIndex: number }
  | { type: "CLOSE_TAB", url: string, tabs: any }
  | { type: "CLOSE_TABS", urls: string[], tabs: any };

export type panelPositionType = "start" | "end";

type UIAction =
  | {
      type: "TOGGLE_ACTIVE_SEARCH",
      value: ?ActiveSearchType
    }
  | {
      type: "OPEN_QUICK_OPEN",
      query?: string
    }
  | {
      type: "CLOSE_QUICK_OPEN"
    }
  | {
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value: boolean
    }
  | {
      type: "SHOW_SOURCE",
      sourceUrl: string
    }
  | {
      type: "TOGGLE_PANE",
      position: panelPositionType,
      paneCollapsed: boolean
    };

type PauseAction =
  | { type: "BREAK_ON_NEXT", value: boolean }
  | { type: "RESUME", value: void }
  | {
      type: "PAUSED",
      pauseInfo: {
        why: Why,
        frame: Frame,
        isInterrupted?: boolean
      },
      scopes: Scope[],
      frames: Frame[],
      selectedFrameId: string,
      loadedObjects: LoadedObject[]
    }
  | {
      type: "PAUSE_ON_EXCEPTIONS",
      shouldPauseOnExceptions: boolean,
      shouldIgnoreCaughtExceptions: boolean
    }
  | { type: "COMMAND", value: { type: string }, command: string }
  | { type: "SELECT_FRAME", frame: Frame, scopes: Scope[] }
  | {
      type: "LOAD_OBJECT_PROPERTIES",
      objectId: string,
      status: string,
      value: Object,
      "@@dispatch/promise": any
    }
  | {
      type: "ADD_EXPRESSION",
      id: number,
      input: string,
      value: string
    }
  | {
      type: "EVALUATE_EXPRESSION",
      input: string,
      value: Object,
      "@@dispatch/promise": any
    }
  | {
      type: "UPDATE_EXPRESSION",
      expression: Expression,
      input: string
    }
  | {
      type: "DELETE_EXPRESSION",
      input: string
    };

type NavigateAction = { type: "NAVIGATE", url: string };

type ASTAction =
  | {
      type: "SET_SYMBOLS",
      source: Source,
      symbols: SymbolDeclaration[]
    }
  | {
      type: "OUT_OF_SCOPE_LOCATIONS",
      locations: AstLocation[]
    }
  | {
      type: "SET_PREVIEW",
      value: {
        expression: string,
        result: any,
        location: AstLocation,
        tokenPos: any,
        cursorPos: any,
        extra: string
      }
    }
  | {
      type: "CLEAR_SELECTION"
    };

export type SourceTreeAction = { type: "SET_EXPANDED_STATE", expanded: any };

export type ProjectTextSearchAction = {
  type: "ADD_QUERY",
  query: string
} & {
  type: "ADD_SEARCH_RESULT",
  result: ProjectTextSearchResult
} & {
    type: "CLEAR_QUERY"
  };

export type FileTextSearchAction =
  | {
      type: "TOGGLE_FILE_SEARCH_MODIFIER",
      modifier: "caseSensitive" | "wholeWord" | "regexMatch"
    }
  | {
      type: "UPDATE_FILE_SEARCH_QUERY",
      query: string
    }
  | {
      type: "UPDATE_SEARCH_RESULTS",
      results: {
        matches: MatchedLocations[],
        matchIndex: number,
        count: number,
        index: number
      }
    };

export type QuickOpenAction =
  | { type: "SET_QUICK_OPEN_QUERY", query: string }
  | { type: "OPEN_QUICK_OPEN", query?: string }
  | { type: "CLOSE_QUICK_OPEN" };

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
  | UIAction
  | ASTAction
  | QuickOpenAction;
