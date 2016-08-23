const { Location, Frame } = require("../types");
const { getOriginalLocation } = require("./source-map");
const { asyncMap } = require("./utils");

async function updateFrameLocation(state, frame) {
  const originalLocation = await getOriginalLocation(
    state,
    frame.location
  );

  return Frame.update(frame, {
    $merge: { location: Location(originalLocation) }
  });
}

async function updateFrameLocations(state, frames) {
  return await asyncMap(frames, item => updateFrameLocation(state, item));
}

module.exports = {
  updateFrameLocations
};
