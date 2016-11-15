const React = require("react");
let { Rep, Grip } = require("devtools-modules");
Rep = React.createFactory(Rep);

function renderRep({ object, mode }) {
  return Rep({ object, defaultRep: Grip, mode });
}

module.exports = renderRep;
