import { getFrames, getSource } from "../../selectors";
import { prettyPrint } from "../../utils/pretty-print";
import { updateFrameLocations } from "../../utils/pause";
import { getPrettySourceURL } from "../../utils/source";

export async function createPrettySource(sourceId, sourceMaps, getState) {
  const source = getSource(getState(), sourceId).toJS();
  const url = getPrettySourceURL(source.url);
  const id = sourceMaps.generatedToOriginalId(sourceId, url);

  const { code, mappings } = await prettyPrint({
    source,
    url
  });

  await sourceMaps.applySourceMap(source.id, url, code, mappings);

  let frames = getFrames(getState());
  if (frames) {
    frames = await updateFrameLocations(frames, sourceMaps);
  }

  return {
    url,
    id,
    isPrettyPrinted: true,
    text: code,
    contentType: "text/javascript",
    frames,
    loading: false
  };
}
