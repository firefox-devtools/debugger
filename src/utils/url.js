/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const defaultUrl = {
  hash: "",
  host: "",
  hostname: "",
  href: "",
  origin: "null",
  password: "",
  pathname: "",
  port: "",
  protocol: "",
  search: "",
  searchParams: {}, // This should be a "URLSearchParams" object
  username: ""
};

export function parse(url: string): URL | object {
  try {
    return new URL(url);
  } catch (err) {
    return defaultUrl;
  }
}
