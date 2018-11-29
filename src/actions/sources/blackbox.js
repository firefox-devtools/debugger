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
import type { Source } from "../../types";
import type { ThunkArgs } from "../types";

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed } = source;

    if (!isBlackBoxed) {
      recordEvent("blackbox");
    }

    const startLocation = await sourceMaps.getGeneratedLocation(
      { sourceId: source.id, line: 1, column: 0 },
      source
    );

    const lines = (await sourceMaps.getOriginalSourceText(source)).text.split(
      "\n"
    );

    let endLocation = { line: null };
    let attempt = 0;
    while (endLocation.line === null) {
      const line = lines.length - attempt;
      const column = lines[line - 1].length - 1;
      console.log(line, column);
      endLocation = await sourceMaps.getGeneratedLocation(
        {
          sourceId: source.id,
          line,
          column: column < 0 ? 0 : column
        },
        source
      );
      attempt++;
    }

    return dispatch({
      type: "BLACKBOX",
      source,
      [PROMISE]: client.blackBox(startLocation.sourceId, isBlackBoxed, {
        start: startLocation,
        end: endLocation
      })
    });
  };
}
