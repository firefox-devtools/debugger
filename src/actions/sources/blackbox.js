/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { isOriginalId } from "devtools-source-map";
import { recordEvent } from "../../utils/telemetry";
import { features } from "../../utils/prefs";

import { PROMISE } from "../utils/middleware/promise";
import {
  getFileGeneratedRange,
  isOriginalId,
  originalToGeneratedId
} from "devtools-source-map";

import type { Source } from "../../types";
import type { ThunkArgs } from "../types";

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed } = source;

    if (!isBlackBoxed) {
      recordEvent("blackbox");
    }

    if (isOriginalId(source.id)) {
      const range = await getFileGeneratedRange(source);
      const generatedId = originalToGeneratedId(source.id);
      return dispatch({
        type: "BLACKBOX",
        source,
        [PROMISE]: client.blackBox(generatedId, isBlackBoxed, range)
      });
    }

    return dispatch({
      type: "BLACKBOX",
      source,
      [PROMISE]: client.blackBox(source.id)
    });
  };
}
