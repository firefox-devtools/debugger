// @flow

import type {
  SymbolDeclarations,
  AstLocation,
  PausePoint
} from "../../workers/parser";
import type { SourceMetaDataType } from "../../reducers/ast.js";

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
      +pausePoints: PausePoint[]
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
