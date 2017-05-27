/* eslint max-nested-callbacks: ["error", 4]*/

const expect = require("expect.js");
import getOutOfScopeLocations from "../getOutOfScopeLocations";

import { getSourceText } from "./helpers";

const loc = (sl, sc, el, ec) => ({
  start: {
    line: sl,
    column: sc
  },
  end: {
    line: el,
    column: ec
  }
});

const locations = {
  outer: loc(3, 14, 23, 1),
  inner: loc(4, 16, 6, 3),
  arrow: loc(8, 16, 10, 3),
  declaration: loc(12, 22, 14, 3),
  assignment: loc(16, 16, 18, 3),
  iifeDeclaration: loc(20, 27, 22, 3),
  exclude: loc(25, 16, 29, 1),
  another: loc(26, 18, 28, 3),
  globalArrow: loc(31, 20, 33, 1),
  globalDeclaration: loc(35, 26, 37, 1),
  globalAssignment: loc(39, 20, 41, 1),
  globalIifeDeclaration: loc(43, 31, 45, 1)
};

describe("Parser.getOutOfScopeLocations", () => {
  it("should exclude non-enclosing function blocks", () => {
    const expected = [
      "arrow",
      "declaration",
      "assignment",
      "iifeDeclaration",
      "exclude",
      "globalArrow",
      "globalDeclaration",
      "globalAssignment",
      "globalIifeDeclaration"
    ].map(n => locations[n]);
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 5,
      column: 5
    });

    expect(actual).to.eql(expected);
  });

  it("should roll up function blocks", () => {
    const expected = [
      "outer",
      "exclude",
      "globalArrow",
      "globalDeclaration",
      "globalAssignment",
      "globalIifeDeclaration"
    ].map(n => locations[n]);
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 24,
      column: 0
    });

    expect(actual).to.eql(expected);
  });

  it("should exclude function for locations on declaration", () => {
    const expected = [
      "outer",
      "exclude",
      "globalArrow",
      "globalDeclaration",
      "globalAssignment",
      "globalIifeDeclaration"
    ].map(n => locations[n]);
    const actual = getOutOfScopeLocations(getSourceText("outOfScope"), {
      line: 3,
      column: 12
    });

    expect(actual).to.eql(expected);
  });
});
