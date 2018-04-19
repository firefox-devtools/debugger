/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parse } from "url";
import { merge } from "lodash";

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

    case "webpack:":
      // A Webpack source is a special case
      return merge(def, {
        path: path,
        group: "webpack://",
        filename: filename
      });

    case "ng:":
      // An Angular source is a special case
      return merge(def, {
        path: path,
        group: "ng://",
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
        // If it's just a URL like "/foo/bar.js", resolve it to the file
        // protocol
        return merge(def, {
          path: path,
          group: "file://",
          filename: filename
        });
      } else if (host === null) {
        // We don't know what group to put this under, and it's a script
        // with a weird URL. Just group them all under an anonymous group.
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
        group: host,
        filename: filename
      });
  }

  return merge(def, {
    path: path,
    group: protocol ? `${protocol}//` : "",
    filename: filename
  });
}
