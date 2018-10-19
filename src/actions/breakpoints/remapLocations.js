/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

 // @flow

export default function remapLocations(breakpoints:any, sourceId:any, sourceMaps:any) {
  const sourceBreakpoints = breakpoints.map(async breakpoint => {
    if (breakpoint.location.sourceId !== sourceId) {
      return breakpoint;
    }
    const location = await sourceMaps.getOriginalLocation(breakpoint.location);
    return { ...breakpoint, location };
  });

  return Promise.all(sourceBreakpoints.valueSeq());
}
