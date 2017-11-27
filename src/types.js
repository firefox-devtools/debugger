/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export type SearchModifiers = {
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
};

export type Expression = {
  value: Object,
  input: string
};

export type Worker = {
  url: string
};

export type Mode =
  | String
  | {
      name: string,
      typescript?: boolean,
      base?: {
        name: string,
        typescript: boolean
      }
    };

export type {
  Breakpoint,
  PendingBreakpoint,
  Frame,
  Grip,
  LoadedObject,
  Location,
  Source,
  Pause,
  Why
} from "debugger-html";
