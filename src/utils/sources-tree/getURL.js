/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parse } from "url";
import { merge } from "lodash";
import { getUnicodeHostname } from "devtools-modules";

export type ParsedURL = {
  path: string,
  group: string,
  filename: string
};

export function getFilenameFromPath(pathname?: string) {
  let filename = "";
  if (pathname) {
    filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    // This file does not have a name. Default should be (index).
    if (filename == "" || !filename.includes(".")) {
      filename = "(index)";
    }
  }
  return filename;
}

const NoDomain = "(no domain)";
export function getURL(sourceUrl: string, debuggeeUrl: string = ""): ParsedURL {
  const url = sourceUrl;
  const def = { path: "", group: "", filename: "" };
  if (!url) {
    return def;
  }

  const { pathname, protocol, host, path } = parse(url);
  const defaultDomain = parse(debuggeeUrl).host;
  const filename = getFilenameFromPath(pathname);

  switch (protocol) {
    case "javascript:":
      // Ignore `javascript:` URLs for now
      return def;

    case "moz-extension:":
    case "resource:":
      return merge(def, {
        path,
        group: `${protocol}//${host || ""}`,
        filename
      });

    case "webpack:":
    case "ng:":
      return merge(def, {
        path: path,
        group: `${protocol}//`,
        filename: filename
      });

    case "about:":
      // An about page is a special case
      return merge(def, {
        path: "/",
        group: url,
        filename: filename
      });

    case "data:":
      return merge(def, {
        path: "/",
        group: NoDomain,
        filename: url
      });

    case null:
      if (pathname && pathname.startsWith("/")) {
        // use file protocol for a URL like "/foo/bar.js"
        return merge(def, {
          path: path,
          group: "file://",
          filename: filename
        });
      } else if (host === null) {
        // use anonymous group for weird URLs
        return merge(def, {
          path: url,
          group: defaultDomain,
          filename: filename
        });
      }
      break;

    case "http:":
    case "https:":
      return merge(def, {
        path: pathname,
        group: getUnicodeHostname(host),
        filename: filename
      });
  }

  return merge(def, {
    path: path,
    group: protocol ? `${protocol}//` : "",
    filename: filename
  });
}
