/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { selectSource } from "../sources";
import { evaluateExpressions } from "../expressions";
import { fetchScopes } from "./fetchScopes";

import type { Frame } from "../../types";
import type { ThunkArgs } from "../types";

/**
 * @memberof actions/pause
 * @static
 */
export function selectFrame(frame: Frame) {
  return async ({ dispatch, client, getState, sourceMaps }: ThunkArgs) => {
    dispatch({
      type: "SELECT_FRAME",
      frame
    });

    const { line, column } = frame.location;
    dispatch(selectSource(frame.location.sourceId, { line, column }));

    dispatch(evaluateExpressions());
    dispatch(fetchScopes());
  };
}
