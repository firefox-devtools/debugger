const { Frame } = require("../tcomb-types");
const { getOriginalLocation } = require("./source-map");

function updateFrameLocations(frames) {
  return Promise.all(
    frames.map(frame => {
      return getOriginalLocation(frame.location).then(loc => {
        return Frame.update(frame, {
          $merge: { location: loc }
        });
      });
    })
  );
}

module.exports = {
  updateFrameLocations
};
