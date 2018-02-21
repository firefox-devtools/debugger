/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isEqual } from "lodash";
import { isOriginalId } from "devtools-source-map";
import type { Frame } from "../../types";
import type { State } from "../../reducers/types";

import {
  getSelectedSource,
  getPreviousPauseFrameLocation
} from "../../selectors";
import { isInvalidPauseLocation } from "../../workers/parser";

export async function shouldStep(
  rootFrame: ?Frame,
  state: State,
  sourceMaps: any
) {
  if (!rootFrame) {
    return false;
  }

  const selectedSource = getSelectedSource(state);
  const previousFrameInfo = getPreviousPauseFrameLocation(state);

  let previousFrameLoc;
  let currentFrameLoc;

  if (selectedSource && isOriginalId(selectedSource.get("id"))) {
    currentFrameLoc = rootFrame.location;
    previousFrameLoc = previousFrameInfo && previousFrameInfo.location;
  } else {
    currentFrameLoc = rootFrame.generatedLocation;
    previousFrameLoc = previousFrameInfo && previousFrameInfo.generatedLocation;
  }

  return (
    isOriginalId(currentFrameLoc.sourceId) &&
    ((previousFrameLoc && isEqual(previousFrameLoc, currentFrameLoc)) ||
      (await isInvalidPauseLocation(currentFrameLoc)))
  );
}
