/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getURL } from "../getURL";
import Url from "url";

let spy;

describe("getUrl", () => {
  it("handles normal url with http and https for filename", function() {
    const urlObject = getURL({ url: "https://a/b.js" });
    expect(urlObject.filename).toBe("b.js");

    const urlObject2 = getURL({ url: "http://a/b.js" });
    expect(urlObject2.filename).toBe("b.js");
  });

  it("handles url with querystring for filename", function() {
    const urlObject = getURL({ url: "https://a/b.js?key=randomKey" });
    expect(urlObject.filename).toBe("b.js");
  });

  it("handles url with '#' for filename", function() {
    const urlObject = getURL({ url: "https://a/b.js#specialSection" });
    expect(urlObject.filename).toBe("b.js");
  });

  it("handles url with no filename for filename", function() {
    const urlObject = getURL({ url: "https://a/c" });
    expect(urlObject.filename).toBe("(index)");
  });

  it("separates resources by protocol and host", () => {
    const urlObject = getURL({ url: "moz-extension://xyz/123" });
    expect(urlObject.group).toBe("moz-extension://xyz");
  });

  it("creates a group name for webpack", () => {
    const urlObject = getURL({ url: "webpack://src/component.jsx" });
    expect(urlObject.group).toBe("webpack://");
  });

  describe("memoized", () => {
    beforeEach(() => {
      spy = jest.spyOn(Url, "parse");
    });

    afterEach(() => {
      spy.mockReset();
      spy.mockRestore();
    });

    it("parses a url once", () => {
      const source = { url: "http://example.com/foo/bar/baz.js" };
      getURL(source);
      const url = getURL(source);
      expect(spy).toHaveBeenCalledTimes(1);

      expect(url).toEqual({
        filename: "baz.js",
        group: "example.com",
        path: "/foo/bar/baz.js"
      });
    });

    it("parses a url once per source", () => {
      const source = { url: "http://example.com/foo/bar/baz.js" };
      const source2 = { url: "http://example.com/foo/bar/baz.js" };
      spy = jest.spyOn(Url, "parse");
      getURL(source);
      const url = getURL(source2);
      expect(spy).toHaveBeenCalledTimes(2);

      expect(url).toEqual({
        filename: "baz.js",
        group: "example.com",
        path: "/foo/bar/baz.js"
      });
    });
  });
});
