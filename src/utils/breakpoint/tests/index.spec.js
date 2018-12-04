/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { sortBreakpoints } from "../index";

describe("breakpoint sorting", () => {
  it("sortBreakpoints should sort by line number and column ", () => {
    const sorted = sortBreakpoints([
      { selectedLocation: { line: 100, column: 2 } },
      { selectedLocation: { line: 9, column: 2 } },
      { selectedLocation: { line: 2, column: undefined } },
      { selectedLocation: { line: 2, column: 7 } }
    ]);

    expect(sorted[0].selectedLocation.line).toBe(2);
    expect(sorted[0].selectedLocation.column).toBe(undefined);
    expect(sorted[1].selectedLocation.line).toBe(2);
    expect(sorted[1].selectedLocation.column).toBe(7);
    expect(sorted[2].selectedLocation.line).toBe(9);
    expect(sorted[3].selectedLocation.line).toBe(100);
  });
});
