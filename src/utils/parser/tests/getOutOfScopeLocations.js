/* eslint max-nested-callbacks: ["error", 4]*/

import getOutOfScopeLocations from "../getOutOfScopeLocations";

import { getSourceText } from "./helpers";

function formatLines(actual) {
  return actual
    .map(
      ({ start, end }) =>
        `(${start.line}, ${start.column}) -> (${end.line}, ${end.column})`
    )
    .join("\n");
}

describe("Parser.getOutOfScopeLocations", () => {
  it("should exclude non-enclosing function blocks", () => {
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 5,
      column: 5
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });

  it("should roll up function blocks", () => {
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 24,
      column: 0
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });

  it("should exclude function for locations on declaration", () => {
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 3,
      column: 12
    });

    expect(formatLines(actual)).toMatchSnapshot();
  });
});
