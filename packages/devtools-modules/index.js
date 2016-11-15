const Services = require("./client/shared/shim/Services");
const SplitBox = require("./client/shared/components/splitter/SplitBox");
// const SplitBoxCSS = require("./client/shared/components/splitter/SplitBox.css")
const Rep = require("./client/shared/components/reps/rep").Rep;
const repUtils = require("./client/shared/components/reps/rep-utils");
const StringRep = require("./client/shared/components/reps/string").StringRep;

// const repCSS = require("./client/shared/components/reps/reps.css");
const Grip = require("./client/shared/components/reps/grip").Grip;
const sprintf = require("./shared/sprintf").sprintf;

module.exports = {
  Services,
  SplitBox,
  // SplitBoxCSS,
  Rep,
  repUtils,
  StringRep,
  // repCSS,
  Grip,
  sprintf
};
