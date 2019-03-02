/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { findSourceMatches } from "../project-search";

const text = `
  function foo() {
    foo();
  }
`;

const modifiers = {
  regexMatch: false,
  caseSensitive: false,
  wholeWord: false
};

describe("project search", () => {
  const emptyResults = [];

  it("throws on lack of source", () => {
    const needle = "test";
    const source: any = null;
    const matches = () => findSourceMatches(source, needle, modifiers);
    expect(matches).toThrow(TypeError);
  });

  it("handles empty source object", () => {
    const needle = "test";
    const source: any = {};
    const matches = findSourceMatches(source, needle, modifiers);
    expect(matches).toEqual(emptyResults);
  });

  it("finds matches", () => {
    const needle = "foo";
    const source: any = {
      text,
      loadedState: "loaded",
      id: "bar.js",
      url: "http://example.com/foo/bar.js"
    };

    const matches = findSourceMatches(source, needle, modifiers);
    expect(matches).toMatchSnapshot();
  });

  it("finds no matches in source", () => {
    const needle = "test";
    const source: any = {
      text,
      loadedState: "loaded",
      id: "bar.js",
      url: "http://example.com/foo/bar.js"
    };
    const matches = findSourceMatches(source, needle, modifiers);
    expect(matches).toEqual(emptyResults);
  });
});
