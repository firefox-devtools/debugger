const React = require("react");
const Rep = React.createFactory(
  require("../lib/devtools/client/shared/components/reps/rep").Rep);
const Grip = require("../lib/devtools/client/shared/components/reps/grip").Grip;

require("../lib/devtools/client/shared/components/reps/reps.css");

function renderRep({ object }) {
  return Rep({ object, defaultRep: Grip });
}

module.exports = renderRep;
