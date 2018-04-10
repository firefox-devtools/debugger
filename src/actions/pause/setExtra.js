/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSymbols, getSource, getSelectedFrame } from "../../selectors";
import { fetchExtra } from "./fetchExtra";

import type { ThunkArgs } from "../types";

export function setExtra() {
  return async function({ dispatch, getState, sourceMaps }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    const source = getSource(getState(), frame.location.sourceId);
    const symbols = getSymbols(getState(), source);

    if (symbols && symbols.classes) {
      dispatch(fetchExtra());
    }
  };
}
