/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { ThunkArgs } from "../types";

export function selectComponent(componentIndex: number) {
  return async ({ dispatch }: ThunkArgs) => {
    dispatch({
      type: "SELECT_COMPONENT",
      componentIndex
    });
  };
}
