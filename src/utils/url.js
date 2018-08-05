/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { unformatUrl } = require("devtools-source-map");
const defaultUrl = {
  hash: "",
  host: "",
  hostname: "",
  href: "",
  origin: "null",
  password: "",
  path: "",
  pathname: "",
  port: "",
  protocol: "",
  search: "",
  // This should be a "URLSearchParams" object
  searchParams: {},
  username: ""
};

export function parse(url: string): URL | object {
  const strippedUrl = unformatUrl(url);
  try {
    const urlObj = new URL(strippedUrl);
    urlObj.path = urlObj.pathname + urlObj.search;
    return urlObj;
  } catch (err) {
    // If we're given simply a filename...
    if (strippedUrl) {
      return { ...defaultUrl, path: strippedUrl, pathname: strippedUrl };
    }

    return defaultUrl;
  }
}
