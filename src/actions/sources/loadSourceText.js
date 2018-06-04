/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isOriginalId } from "devtools-source-map";
import { PROMISE } from "../utils/middleware/promise";
import { getSource, getGeneratedSource } from "../../selectors";
import * as parser from "../../workers/parser";
import { isLoaded } from "../../utils/source";

import defer from "../../utils/defer";
import type { Action, ThunkArgs } from "../types";
import type { SourceRecord } from "../../types";

const requests = new Map();
import { Services } from "devtools-modules";
const loadSourceHistogram = Services.telemetry.getHistogramById(
  "DEVTOOLS_DEBUGGER_LOAD_SOURCE_MS"
);

async function loadSource(source: SourceRecord, { sourceMaps, client }) {
  const id = source.get("id");
  if (isOriginalId(id)) {
    return sourceMaps.getOriginalSourceText(source.toJS());
  }

  const response = await client.sourceContents(id);
  return {
    id,
    text: response.source,
    contentType: response.contentType || "text/javascript"
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function loadSourceText(source: SourceRecord) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const id = source.get("id");

    // Fetch the source text only once.
    if (requests.has(id)) {
      return requests.get(id);
    }

    if (isLoaded(source)) {
      return Promise.resolve();
    }

    const telemetryStart = performance.now();
    const deferred = defer();
    requests.set(id, deferred.promise);

    try {
      await dispatch(
        ({
          type: "LOAD_SOURCE_TEXT",
          sourceId: id,
          [PROMISE]: loadSource(source, { sourceMaps, client })
        }: Action)
      );
    } catch (e) {
      deferred.resolve();
      requests.delete(id);
      return;
    }

    const newSource = getSource(getState(), source.get("id")).toJS();

    if (isOriginalId(newSource.id) && !newSource.isWasm) {
      const generatedSource = getGeneratedSource(getState(), source);
      await dispatch(loadSourceText(generatedSource));
    }

    if (!newSource.isWasm) {
      await parser.setSource(newSource);
    }

    // signal that the action is finished
    deferred.resolve();
    requests.delete(id);

    const telemetryEnd = performance.now();
    const duration = telemetryEnd - telemetryStart;
    loadSourceHistogram.add(duration);
  };
}
