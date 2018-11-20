/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getColumnBreakpoints } from "../visibleColumnBreakpoints";

function pp(line, column) {
  return { location: { line, column }, types: { break: true } };
}

function bp(line, column) {
  return { location: { line, column, sourceId: "foo" } };
}

const pausePoints = [pp(1, 1), pp(1, 5), pp(3, 1)];
const breakpoints = [bp(1, 1), bp(4, 0), bp(4, 3)];

describe("visible column breakpoints", () => {
  it("simple", () => {
    const viewport = {
      start: { line: 1, column: 0 },
      end: { line: 10, column: 10 }
    };
    const columnBps = getColumnBreakpoints(pausePoints, breakpoints, viewport);
    expect(columnBps).toMatchSnapshot();
  });
});
