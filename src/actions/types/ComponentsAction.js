/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export type ComponentsAction =
  | {|
      +type: "SET_COMPONENT_ANCESTORS",
      +ancestors: Object[]
    |}
  | {|
      +type: "SELECT_COMPONENT",
      +id: string
    |};
