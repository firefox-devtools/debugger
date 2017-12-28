/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getSource } from "../../selectors";
import { prettyPrint } from "../../workers/pretty-print";
import { getPrettySourceURL } from "../../utils/source";

export function createPrettySource(sourceId) {
  return async ({ dispatch, getState, sourceMaps }) => {
    const source = getSource(getState(), sourceId);
    const url = getPrettySourceURL(source.get("url"));
    const id = await sourceMaps.generatedToOriginalId(sourceId, url);

    const prettySource = {
      url,
      id,
      isPrettyPrinted: true,
      contentType: "text/javascript",
      loadedState: "loading"
    };
    dispatch({ type: "ADD_SOURCE", source: prettySource });

    const { code, mappings } = await prettyPrint({ source, url });
    await sourceMaps.applySourceMap(source.get("id"), url, code, mappings);

    dispatch({
      type: "UPDATE_SOURCE",
      source: { ...prettySource, text: code, loadedState: "loaded" }
    });

    return prettySource;
  };
}
