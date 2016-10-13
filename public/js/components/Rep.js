const React = require("react");
const { rep, Grip } = require("devtools-modules");
const Rep = React.createFactory(rep);

function renderRep({ object, mode }) {
  return Rep({ object, defaultRep: Grip, mode });
}

module.exports = renderRep;
