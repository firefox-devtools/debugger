// @flow
const React = require("react");

import type { ObjectInspectorItemContentsValue } from "../../types";

type RepRender = {
  object: ObjectInspectorItemContentsValue,
  mode: string
};

let { REPS: { Rep, Grip }} = require("devtools-reps");
Rep = React.createFactory(Rep);

function renderRep({ object, mode }: RepRender) {
  return Rep({ object, defaultRep: Grip, mode });
}

module.exports = renderRep;
