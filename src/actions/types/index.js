/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Frame, Scope, Why, Worker } from "../../types";
import type { State } from "../../reducers/types";
import type { MatchedLocations } from "../../reducers/file-search";

import type { BreakpointAction } from "./BreakpointAction";
import type { SourceAction } from "./SourceAction";
import type { UIAction } from "./UIAction";
import type { PauseAction } from "./PauseAction";
import type { ASTAction } from "./ASTAction";

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
  openLink: (url: string) => void,
  openWorkerToolbox: (worker: Worker) => void
};

export type Thunk = ThunkArgs => any;

export type ActionType = Object | Function;

type ProjectTextSearchResult = {
  sourceId: string,
  filepath: string,
  matches: MatchedLocations[]
};

type ReplayAction =
  | {|
      +type: "TRAVEL_TO",
      +data: {
        paused: {
          why: Why,
          scopes: Scope[],
          frames: Frame[],
          selectedFrameId: string,
          loadedObjects: Object
        },
        expressions?: Object[]
      },
      +position: number
    |}
  | {|
      +type: "CLEAR_HISTORY"
    |};

type NavigateAction =
  | {| +type: "CONNECT", +url: string, +canRewind: boolean |}
  | {| +type: "NAVIGATE", +url: string |};

export type SourceTreeAction = {|
  +type: "SET_EXPANDED_STATE",
  +expanded: any
|};

export type ProjectTextSearchAction =
  | {| +type: "ADD_QUERY", +query: string |}
  | {|
      +type: "ADD_SEARCH_RESULT",
      +result: ProjectTextSearchResult
    |}
  | {| +type: "CLEAR_QUERY" |}
  | {| +type: "UPDATE_STATUS", +status: string |}
  | {| +type: "CLEAR_SEARCH_RESULTS" |}
  | {| +type: "CLEAR_SEARCH" |};

export type FileTextSearchModifier =
  | "caseSensitive"
  | "wholeWord"
  | "regexMatch";

export type FileTextSearchAction =
  | {|
      +type: "TOGGLE_FILE_SEARCH_MODIFIER",
      +modifier: FileTextSearchModifier
    |}
  | {|
      +type: "UPDATE_FILE_SEARCH_QUERY",
      +query: string
    |}
  | {|
      +type: "UPDATE_SEARCH_RESULTS",
      +results: {
        matches: MatchedLocations[],
        matchIndex: number,
        count: number,
        index: number
      }
    |};

export type QuickOpenAction =
  | {| +type: "SET_QUICK_OPEN_QUERY", +query: string |}
  | {| +type: "OPEN_QUICK_OPEN", +query?: string |}
  | {| +type: "CLOSE_QUICK_OPEN" |};

export type CoverageAction = {|
  +type: "RECORD_COVERAGE",
  +value: { coverage: Object }
|};

export type DebugeeAction = {|
  +type: "SET_WORKERS",
  +workers: {
    workers: Object[]
  }
|};

export type {
  StartPromiseAction,
  DonePromiseAction,
  ErrorPromiseAction
} from "../utils/middleware/promise";

export type { panelPositionType } from "./UIAction";

export type { ASTAction } from "./ASTAction";

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
  | QuickOpenAction
  | FileTextSearchAction
  | ProjectTextSearchAction
  | CoverageAction
  | DebugeeAction
  | ReplayAction;
