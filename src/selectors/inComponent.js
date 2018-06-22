/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSymbols, getSource, getSelectedFrame } from ".";
import { findClosestClass } from "../utils/ast";
import { getSourceMetaData } from "../reducers/ast";

import type { State } from "../reducers/types";

export function inComponent(state: State) {
  const selectedFrame = getSelectedFrame(state);
  if (!selectedFrame) {
    return;
  }

  const source = getSource(state, selectedFrame.location.sourceId);
  if (!source) {
    return;
  }

  const symbols = getSymbols(state, source);

  if (!symbols) {
    return;
  }

  const closestClass = findClosestClass(symbols, selectedFrame.location);
  if (!closestClass) {
    return null;
  }

  const sourceMetaData = getSourceMetaData(state, source.id);

  if (!sourceMetaData || !sourceMetaData.framework) {
    return;
  }

  const inReactFile = sourceMetaData.framework == "React";
  const isComponent =
    closestClass.parent &&
    ["Component", "PureComponent"].includes(closestClass.parent.name);

  if (inReactFile && isComponent) {
    return closestClass.name;
  }
}
