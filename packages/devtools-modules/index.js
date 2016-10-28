const Services = require("./client/shared/shim/Services");
const SplitBox = require("./client/shared/components/splitter/SplitBox");
// const SplitBoxCSS = require("./client/shared/components/splitter/SplitBox.css")
const rep = require("./client/shared/components/reps/rep").Rep;
// const repCSS = require("./client/shared/components/reps/reps.css");
const Grip = require("./client/shared/components/reps/grip").Grip;
const sprintf = require("./shared/sprintf").sprintf;

module.exports = {
  Services,
  SplitBox,
  // SplitBoxCSS,
  rep,
  // repCSS,
  Grip,
  sprintf
};
