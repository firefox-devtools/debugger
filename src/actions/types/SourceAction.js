/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Location, Source } from "../../types";
import type { PromiseAction } from "../utils/middleware/promise";

export type SourceAction =
  | {|
      +type: "ADD_SOURCE",
      +source: Source
    |}
  | {|
      +type: "ADD_SOURCES",
      +sources: Array<Source>
    |}
  | {|
      +type: "UPDATE_SOURCE",
      +source: Source
    |}
  | {|
      +type: "SELECT_SOURCE",
      +source: Source,
      +location?: Location
    |}
  | {|
      +type: "SELECT_SOURCE_URL",
      +url: string,
      +line: ?number
    |}
  | PromiseAction<
      {|
        +type: "LOAD_SOURCE_TEXT",
        +sourceId: string
      |},
      Source
    >
  | {| type: "CLEAR_SELECTED_SOURCE" |}
  | PromiseAction<
      {|
        +type: "BLACKBOX",
        +source: Source
      |},
      {|
        +isBlackBoxed: boolean
      |}
    >
  | {|
      +type: "ADD_TAB",
      +source: Source,
      +tabIndex: number
    |}
  | {|
      +type: "MOVE_TAB",
      +url: string,
      +tabIndex: number
    |}
  | {|
      +type: "CLOSE_TAB",
      +url: string,
      +tabs: any
    |}
  | {|
      +type: "CLOSE_TABS",
      +urls: string[],
      +tabs: any
    |};
