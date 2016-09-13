const { Location, Frame } = require("../types");
const { getOriginalLocation } = require("./source-map");
const { asyncMap } = require("./utils");

async function updateFrameLocation(sources, frame) {
  const originalLocation = await getOriginalLocation(
    sources,
    frame.location
  );

  return Frame.update(frame, {
    $merge: { location: Location(originalLocation) }
  });
}

async function updateFrameLocations(sources, frames) {
  return await asyncMap(frames, item => updateFrameLocation(sources, item));
}

module.exports = {
  updateFrameLocations
};
