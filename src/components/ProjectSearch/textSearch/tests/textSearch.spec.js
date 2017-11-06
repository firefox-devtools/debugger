/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { highlightMatches } from "../utils/highlight";

describe("project search - highlightMatches", () => {
  it("simple", () => {
    const lineMatch = {
      value: "This is a sample sentence",
      column: 17,
      match: "sentence"
    };
    expect(highlightMatches(lineMatch)).toMatchSnapshot();
  });
});
describe("project search - highlightMatches", () => {
  it("simple", () => {
    const lineMatch = {
      value: "lets foo and then baa",
      column: 5,
      match: "foo"
    };
    expect(highlightMatches(lineMatch)).toMatchSnapshot();
  });
});
