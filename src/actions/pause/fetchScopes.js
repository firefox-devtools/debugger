/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedFrame, getGeneratedFrameScope } from "../../selectors";
import { mapScopes } from "./mapScopes";
import { getExtra } from "../preview";
import { PROMISE } from "../utils/middleware/promise";

import type { ThunkArgs } from "../types";

export function fetchScopes() {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    if (!frame || getGeneratedFrameScope(getState(), frame.id)) {
      return;
    }

    const extra = await dispatch(getExtra("this;", frame.this, frame));

    const scopes = dispatch({
      type: "ADD_SCOPES",
      frame,
      extra,
      [PROMISE]: client.getFrameScopes(frame)
    });

    await dispatch(mapScopes(scopes, frame));
  };
}
