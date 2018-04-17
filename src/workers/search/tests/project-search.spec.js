/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { findSourceMatches } from "../project-search";

const text = `
  function foo() {
    foo();
  }
`;

describe("project search", () => {
  it("simple", () => {
    const source = {
      text,
      loadedState: "loaded",
      id: "bar.js",
      url: "http://example.com/foo/bar.js"
    };

    const matches = findSourceMatches(source, "foo");
    expect(matches).toMatchSnapshot();
  });
});
