/* eslint max-nested-callbacks: ["error", 4]*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import findOutOfScopeLocations from "../findOutOfScopeLocations";

import { getSource } from "./helpers";
import { setSource } from "../sources";

function formatLines(actual) {
  return actual
    .map(
      ({ start, end }) =>
        `(${start.line}, ${start.column}) -> (${end.line}, ${end.column})`
    )
    .join("\n");
}

describe("Parser.findOutOfScopeLocations", () => {
  it("should exclude non-enclosing function blocks", () => {
    const source = getSource("outOfScope");
    setSource(source);
    const actual = findOutOfScopeLocations("outOfScope", {
      line: 5,
      column: 5
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });

  it("should roll up function blocks", () => {
    const source = getSource("outOfScope");
    setSource(source);
    const actual = findOutOfScopeLocations("outOfScope", {
      line: 24,
      column: 0
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });

  it("should exclude function for locations on declaration", () => {
    const source = getSource("outOfScope");
    setSource(source);
    const actual = findOutOfScopeLocations("outOfScope", {
      line: 3,
      column: 12
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });

  it("should treat comments as out of scope", () => {
    const source = getSource("outOfScopeComment");
    setSource(source);
    const actual = findOutOfScopeLocations("outOfScopeComment", {
      line: 3,
      column: 2
    });

    expect(actual).toEqual([
      { end: { column: 15, line: 1 }, start: { column: 0, line: 1 } }
    ]);
  });

  it("should not exclude in-scope inner locations", () => {
    const source = getSource("outOfScope");
    setSource(source);
    const actual = findOutOfScopeLocations("outOfScope", {
      line: 61,
      column: 0
    });
    expect(formatLines(actual)).toMatchSnapshot();
  });
});
