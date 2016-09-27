const { Frame } = require("../types");
const { getOriginalLocation } = require("./source-map");
const { asyncMap } = require("./utils");

function updateFrameLocations(frames) {
  return asyncMap(frames, async function(frame) {
    return Frame.update(frame, {
      $merge: { location: await getOriginalLocation(frame.location) }
    });
  });
}

module.exports = {
  updateFrameLocations
};
