/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { PROMISE } from "../utils/middleware/promise";
import { setSymbols } from "../ast";
import { getSource } from "../../selectors";
import { setSource } from "../../workers/parser";
import { isLoading, isLoaded } from "../../utils/source";
import type { Source } from "../../types";
import type { ThunkArgs } from "../types";

const requests = new Map();

async function loadSource(source: Source, { sourceMaps, client }) {
  if (sourceMaps.isOriginalId(source.id)) {
    return await sourceMaps.getOriginalSourceText(source);
  }

  const response = await client.sourceContents(source.id);

  return {
    id: source.id,
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
export function loadSourceText(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const deferred = defer();

    // Fetch the source text only once.
    if (isLoaded(source)) {
      return Promise.resolve(source);
    }

    if (isLoading(source) || requests.has(source.id)) {
      return requests.get(source.id);
    }

    requests.set(source.id, deferred.promise);
    await dispatch({
      type: "LOAD_SOURCE_TEXT",
      source: source,
      [PROMISE]: loadSource(source, { sourceMaps, client })
    });

    requests.delete(source.id);

    const newSource = getSource(getState(), source.id).toJS();
    if (newSource.isWasm) {
      return;
    }

    await setSource(newSource);
    dispatch(setSymbols(source.id));
    return deferred.resolve();
  };
}
