import { getFrames, getSource } from "../../selectors";
import { prettyPrint } from "../../workers/pretty-print";
import { updateFrameLocations } from "../../utils/pause";
import { getPrettySourceURL } from "../../utils/source";

export function createPrettySource(sourceId) {
  return async ({ dispatch, getState, sourceMaps }) => {
    const source = getSource(getState(), sourceId).toJS();
    const url = getPrettySourceURL(source.url);
    const id = await sourceMaps.generatedToOriginalId(sourceId, url);

    const { code, mappings } = await prettyPrint({
      source,
      url
    });

    await sourceMaps.applySourceMap(source.id, url, code, mappings);

    let frames = getFrames(getState());
    if (frames) {
      frames = await updateFrameLocations(frames, sourceMaps);
    }

    const prettySource = {
      url,
      id,
      isPrettyPrinted: true,
      text: code,
      contentType: "text/javascript",
      frames,
      loadedState: "loaded"
    };

    dispatch({
      type: "ADD_SOURCE",
      source: prettySource
    });

    return prettySource;
  };
}
