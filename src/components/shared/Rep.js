// @flow
const React = require("react");

let { REPS: { Rep, Grip }} = require("devtools-reps");
Rep = React.createFactory(Rep);

function renderRep({ object, mode }) {
  return Rep({ object, defaultRep: Grip, mode });
}

module.exports = renderRep;
