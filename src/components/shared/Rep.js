// @flow
import { createFactory } from "react";

import type { ObjectInspectorItemContentsValue } from "./ObjectInspector";

type RenderRepOptions = {
  object: ObjectInspectorItemContentsValue,
  mode: string
};

import { REPS } from "devtools-reps";
const { Rep: _Rep, Grip } = REPS;
const Rep = createFactory(_Rep);

export default function renderRep({ object, mode }: RenderRepOptions) {
  return Rep({ object, defaultRep: Grip, mode });
}
