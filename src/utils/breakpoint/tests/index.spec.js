/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { sortBreakpoints, sortSelectedBreakpoints } from "../index";

describe("breakpoint sorting", () => {
  it("sortSelectedBreakpoints should sort by line number and column ", () => {
    const sorted = sortSelectedBreakpoints(
      [
        { location: { line: 100, column: 2 } },
        { location: { line: 9, column: 2 } },
        { location: { line: 2, column: undefined } },
        { location: { line: 2, column: 7 } }
      ],
      { id: "foo/originalSource-1" }
    );

    expect(sorted[0].location.line).toBe(2);
    expect(sorted[0].location.column).toBe(undefined);
    expect(sorted[1].location.line).toBe(2);
    expect(sorted[1].location.column).toBe(7);
    expect(sorted[2].location.line).toBe(9);
    expect(sorted[3].location.line).toBe(100);
  });

  it("sortBreakpoints should sort by line number and column ", () => {
    const sorted = sortBreakpoints([
      { location: { line: 100, column: 2 } },
      { location: { line: 9, column: 2 } },
      { location: { line: 2, column: undefined } },
      { location: { line: 2, column: 7 } }
    ]);

    expect(sorted[0].location.line).toBe(2);
    expect(sorted[0].location.column).toBe(undefined);
    expect(sorted[1].location.line).toBe(2);
    expect(sorted[1].location.column).toBe(7);
    expect(sorted[2].location.line).toBe(9);
    expect(sorted[3].location.line).toBe(100);
  });
});
