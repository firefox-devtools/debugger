// @flow

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { comparePosition } from "../location";
import { getSelectedLocation } from "../source-maps";
import type {
  BreakpointPositions,
  SourceLocation,
  Position,
  Source
} from "../../types";

export function findPosition(
  positions: ?BreakpointPositions,
  location: Position | SourceLocation,
  source: ?Source
) {
  if (!positions || !source) {
    return null;
  }

  return positions.find(pos =>
    comparePosition(getSelectedLocation(pos, source), location)
  );
}
