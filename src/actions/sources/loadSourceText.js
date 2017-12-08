/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isOriginalId } from "devtools-source-map";
import { PROMISE } from "../utils/middleware/promise";
import { setSymbols } from "../ast";
import { getSource, getGeneratedSource } from "../../selectors";
import { setSource } from "../../workers/parser";
import { isLoading, isLoaded } from "../../utils/source";
import type { ThunkArgs } from "../types";
import type { SourceRecord } from "../../reducers/types";

const requests = new Map();

async function loadSource(source: SourceRecord, { sourceMaps, client }) {
  const id = source.get("id");
  if (isOriginalId(id)) {
    return await sourceMaps.getOriginalSourceText(source.toJS());
  }

  const response = await client.sourceContents(id);

  return {
    id,
    text: response.source,
    contentType: response.contentType || "text/javascript"
  };
}

function defer() {
  let resolve = () => {};
  let reject = () => {};
  const promise = new Promise((_res, _rej) => {
    resolve = _res;
    reject = _rej;
  });

  return { resolve, reject, promise };
}

/**
 * @memberof actions/sources
 * @static
 */
export function loadSourceText(source: SourceRecord) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const deferred = defer();

    // Fetch the source text only once.
    if (isLoaded(source)) {
      return Promise.resolve(source);
    }

    const id = source.get("id");

    if (isLoading(source) || requests.has(id)) {
      return requests.get(id);
    }

    requests.set(id, deferred.promise);
    await dispatch({
      type: "LOAD_SOURCE_TEXT",
      source: { id: source.get("id") },
      [PROMISE]: loadSource(source, { sourceMaps, client })
    });

    const newSource = getSource(getState(), source.get("id")).toJS();
    if (newSource.isWasm) {
      return;
    }

    if (isOriginalId(newSource.id)) {
      const generatedSource = getGeneratedSource(getState(), source.toJS());
      await dispatch(loadSourceText(generatedSource));
    }

    await setSource(newSource);
    dispatch(setSymbols(id));

    // signal that the action is finished
    deferred.resolve();
    requests.delete(id);
  };
}
