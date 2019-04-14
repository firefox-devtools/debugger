/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedFrame, getGeneratedFrameScope } from "../../selectors";
import { mapScopes } from "./mapScopes";
import { PROMISE } from "../utils/middleware/promise";
import type { ThreadId } from "../../types";
import type { ThunkArgs } from "../types";

export function fetchScopes(thread: ThreadId) {
  return async function({ dispatch, getState, client, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState(), thread);
    if (!frame || getGeneratedFrameScope(getState(), frame.id)) {
      return;
    }

    const scopes = dispatch({
      type: "ADD_SCOPES",
      thread,
      frame,
      [PROMISE]: client.getFrameScopes(frame)
    });

    await dispatch(mapScopes(scopes, frame));
  };
}
