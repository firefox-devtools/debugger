// @flow
const React = require("react");

import type { ObjectInspectorItemContentsValue } from "./ObjectInspector";

type RenderRepOptions = {
  object: ObjectInspectorItemContentsValue,
  mode: string,
};

let { REPS: { Rep, Grip } } = require("devtools-reps");
Rep = React.createFactory(Rep);

function renderRep({ object, mode }: RenderRepOptions) {
  return Rep({ object, defaultRep: Grip, mode });
}

module.exports = renderRep;
