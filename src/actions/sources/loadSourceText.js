/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isOriginalId } from "devtools-source-map";
import { PROMISE } from "../utils/middleware/promise";
import {
  getSource,
  getGeneratedSource,
  getSources,
  getTextSearchQuery
} from "../../selectors";
import * as parser from "../../workers/parser";
import { isThirdParty, isLoading, isLoaded } from "../../utils/source";

import defer from "../../utils/defer";
import type { ThunkArgs } from "../types";
import type { SourceRecord } from "../../reducers/types";
import { searchSource } from "../project-text-search";

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

/**
  Load the text for all the available sources
 * @memberof actions/sources
 * @static
 */
export function loadAllSources() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sources = getSources(getState());
    const query = getTextSearchQuery(getState());
    for (const [, source] of sources) {
      if (isThirdParty(source)) {
        continue;
      }

      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source.get("id"), query));
      }
    }
  };
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
      sourceId: id,
      [PROMISE]: loadSource(source, { sourceMaps, client })
    });

    const newSource = getSource(getState(), source.get("id")).toJS();

    if (isOriginalId(newSource.id) && !newSource.isWasm) {
      const generatedSource = getGeneratedSource(getState(), source.toJS());
      await dispatch(loadSourceText(generatedSource));
    }

    if (!newSource.isWasm) {
      await parser.setSource(newSource);
    }

    console.log("LOAD_SOURCE_TEXT LOADED");

    // signal that the action is finished
    deferred.resolve();
    requests.delete(id);
  };
}
