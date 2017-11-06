/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedSource } from "../../selectors";
import { addHiddenBreakpoint } from "../breakpoints";
import { resume } from "./commands";

import type { ThunkArgs } from "../types";

export function continueToHere(line: number) {
  return async function({ dispatch, getState }: ThunkArgs) {
    const source = getSelectedSource(getState()).toJS();

    await dispatch(
      addHiddenBreakpoint({
        line,
        column: undefined,
        sourceId: source.id
      })
    );

    dispatch(resume());
  };
}
