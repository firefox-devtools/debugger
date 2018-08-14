/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Location } from "debugger-html";

// Returns expanded stack frames details based on the generated location.
// The function return null if not information was found.
async function getOriginalStackFrames(
  generatedLocation: Location
): Promise<?Array<{
  displayName: string,
  location?: Location
}>> {
  // Reserved for experemental source maps formats.
  return null;
}

module.exports = {
  getOriginalStackFrames
};
