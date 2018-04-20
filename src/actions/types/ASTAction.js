/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { SourceMetaDataType } from "../../reducers/ast.js";
import type { Source } from "../../types";
import type {
  SymbolDeclarations,
  AstLocation,
  PausePoints
} from "../../workers/parser";

import type { PromiseAction } from "../utils/middleware/promise";

export type ASTAction =
  | PromiseAction<
      {|
        +type: "SET_SYMBOLS",
        +source: Source
      |},
      SymbolDeclarations
    >
  | {|
      +type: "SET_PAUSE_POINTS",
      +source: Source,
      +pausePoints: PausePoints
    |}
  | {|
      +type: "OUT_OF_SCOPE_LOCATIONS",
      +locations: ?(AstLocation[])
    |}
  | {|
      +type: "IN_SCOPE_LINES",
      +lines: AstLocation[]
    |}
  | PromiseAction<
      {|
        +type: "SET_PREVIEW"
      |},
      {
        expression: string,
        result: any,
        location: AstLocation,
        tokenPos: any,
        cursorPos: any,
        extra: any
      }
    >
  | {|
      +type: "SET_SOURCE_METADATA",
      +sourceId: string,
      +sourceMetaData: SourceMetaDataType
    |}
  | {|
      +type: "CLEAR_SELECTION"
    |};
