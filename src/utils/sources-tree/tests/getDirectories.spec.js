/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { createSource } from "../../../reducers/sources";

import { getDirectories, createTree } from "../index";

function formatDirectories(source, parentMap, tree) {
  const paths = getDirectories(source, parentMap, tree);
  return paths.map(node => node.path);
}

function createSources(urls) {
  return urls.reduce((sources, url, index) => {
    const id = `a${index}`;
    sources[id] = createSource({ url, id });
    return sources;
  }, {});
}

describe("getDirectories", () => {
  it("gets a source's ancestor directories", function() {
    const sources = createSources([
      "http://a/b.js",
      "http://a/c.js",
      "http://b/c.js"
    ]);

    const debuggeeUrl = "http://a/";
    const { sourceTree, parentMap } = createTree({ sources, debuggeeUrl });
    expect(formatDirectories(sources.a0, parentMap, sourceTree)).toEqual(["a/b.js", "a"]);
    expect(formatDirectories(sources.a1, parentMap, sourceTree)).toEqual(["a/c.js", "a"]);
    expect(formatDirectories(sources.a2, parentMap, sourceTree)).toEqual(["b/c.js", "b"]);
  });
});
