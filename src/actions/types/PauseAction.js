/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Command } from "../../reducers/types";
import type { Expression, LoadedObject, Frame, Scope, Why } from "../../types";

import type { PromiseAction } from "../utils/middleware/promise";

export type PauseAction =
  | {|
      +type: "BREAK_ON_NEXT",
      +value: boolean
    |}
  | {|
      +type: "RESUME",
      +value: void
    |}
  | {|
      +type: "PAUSED",
      +why: Why,
      +scopes: Scope,
      +frames: Frame[],
      +selectedFrameId: string,
      +loadedObjects: LoadedObject[]
    |}
  | {|
      +type: "PAUSE_ON_EXCEPTIONS",
      +shouldPauseOnExceptions: boolean,
      +shouldIgnoreCaughtExceptions: boolean
    |}
  | PromiseAction<{|
      +type: "COMMAND",
      +command: Command
    |}>
  | {|
      +type: "SELECT_FRAME",
      +frame: Frame
    |}
  | {|
      +type: "SET_POPUP_OBJECT_PROPERTIES",
      +objectId: string,
      +properties: Object
    |}
  | {|
      +type: "ADD_EXPRESSION",
      +id: number,
      +input: string,
      +value: string,
      +expressionError: ?string
    |}
  | PromiseAction<
      {|
        +type: "EVALUATE_EXPRESSION",
        +input: string
      |},
      Object
    >
  | PromiseAction<{|
      +type: "EVALUATE_EXPRESSIONS",
      +results: Expression[],
      +inputs: string[]
    |}>
  | {|
      +type: "UPDATE_EXPRESSION",
      +expression: Expression,
      +input: string,
      +expressionError: ?string
    |}
  | {|
      +type: "DELETE_EXPRESSION",
      +input: string
    |}
  | {|
      +type: "CLEAR_EXPRESSION_ERROR"
    |}
  | PromiseAction<
      {|
        +type: "MAP_SCOPES",
        +frame: Frame
      |},
      {
        scope: Scope,
        mappings: {
          [string]: string | null
        }
      }
    >
  | {|
      +type: "MAP_FRAMES",
      +frames: Frame[]
    |}
  | {|
      +type: "ADD_EXTRA",
      +extra: any
    |}
  | PromiseAction<
      {|
        +type: "ADD_SCOPES",
        +frame: Frame
      |},
      Scope
    >;
