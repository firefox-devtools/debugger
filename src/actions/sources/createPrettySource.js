import { getFrames, getSource, getSourceByURL } from "../../selectors";
import { prettyPrint } from "../../utils/pretty-print";
import { updateFrameLocations } from "../../utils/pause";
import { getPrettySourceURL, shouldPrettyPrint } from "../../utils/source";

export async function createPrettySource(sourceId, sourceMaps, getState) {
  const source = getSource(getState(), sourceId).toJS();
  const url = getPrettySourceURL(source.url);
  const prettySource = getSourceByURL(getState(), url);
  const hasPrettySource = !!prettySource;

  if (!shouldPrettyPrint(source) || hasPrettySource) {
    return null;
  }

  const id = sourceMaps.generatedToOriginalId(source.id, url);
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
    prettySource: {
      url,
      id,
      isPrettyPrinted: true,
      text: code,
      contentType: "text/javascript",
      frames,
      loading: false
    },
    mappings
  };
}
