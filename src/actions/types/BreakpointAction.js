/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Breakpoint, Location } from "../../types";

import type { PromiseAction } from "../utils/middleware/promise";

type AddBreakpointResult = {
  previousLocation: Location,
  breakpoint: Breakpoint
};

export type BreakpointAction =
  | PromiseAction<
      {|
        +type: "ADD_BREAKPOINT",
        +breakpoint: Breakpoint,
        +condition?: string
      |},
      AddBreakpointResult
    >
  | PromiseAction<{|
      +type: "REMOVE_BREAKPOINT",
      +breakpoint: Breakpoint,
      +disabled: boolean
    |}>
  // for simulating a successful server request
  | {|
      +type: "REMOVE_BREAKPOINT",
      +breakpoint: Breakpoint,
      +status: "done"
    |}
  | {|
      +type: "SET_BREAKPOINT_CONDITION",
      +breakpoint: Breakpoint
    |}
  | PromiseAction<{|
      +type: "TOGGLE_BREAKPOINTS",
      +shouldDisableBreakpoints: boolean
    |}>
  | {|
      +type: "SYNC_BREAKPOINT",
      +breakpoint: ?Breakpoint,
      +previousLocation: Location
    |}
  | PromiseAction<
      {|
        +type: "ENABLE_BREAKPOINT",
        +breakpoint: Breakpoint
      |},
      AddBreakpointResult
    >
  | {|
      +type: "DISABLE_BREAKPOINT",
      +breakpoint: Breakpoint
    |}
  | {|
      +type: "DISABLE_ALL_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |}
  | {|
      +type: "ENABLE_ALL_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |}
  | {|
      +type: "REMAP_BREAKPOINTS",
      +breakpoints: Breakpoint[]
    |};
