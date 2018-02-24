/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedFrame } from "../../selectors";
import { getExtra } from "../preview";
import type { ThunkArgs } from "../types";

export function fetchExtra() {
  return async function({ dispatch, getState }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    const extra = await dispatch(getExtra("this;", frame.this));
    dispatch({
      type: "ADD_EXTRA",
      extra: extra
    });
  };
}
