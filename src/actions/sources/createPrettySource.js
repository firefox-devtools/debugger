/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getFrames, getSource } from "../../selectors";
import { prettyPrint } from "../../workers/pretty-print";
import { updateFrameLocations } from "../../utils/pause";
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
      text: "Loading...",
      contentType: "text/javascript",
      frames: [],
      loadedState: "loadeding"
    };
    dispatch({ type: "ADD_SOURCE", source: prettySource });

    dispatch({
      type: "UPDATE_SOURCE",
      source: {
        id: sourceId,
        loadedState: "loading"
      }
    });

    const { code, mappings } = await prettyPrint({
      source,
      url
    });

    await sourceMaps.applySourceMap(source.get("id"), url, code, mappings);

    let frames = getFrames(getState());
    if (frames) {
      frames = await updateFrameLocations(frames, sourceMaps);
    }

    prettySource.text = code;
    prettySource.frames = frames;
    prettySource.loadedState = "loaded";

    dispatch({
      type: "UPDATE_SOURCES",
      sources: [
        {
          id: sourceId,
          loadedState: "loaded"
        },
        prettySource
      ]
    });

    return prettySource;
  };
}
