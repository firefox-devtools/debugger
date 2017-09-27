// @flow

import { parse } from "url";
import { merge } from "lodash";

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

export function getURL(
  sourceUrl: string,
  debuggeeUrl: string = ""
): { path: string, group: string } {
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
        group: "Webpack",
        filename: filename
      });

    case "about:":
      // An about page is a special case
      return merge(def, {
        path: "/",
        group: url,
        filename: filename
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
