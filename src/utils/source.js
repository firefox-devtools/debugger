// @flow

/**
 * Utils for working with Source URLs
 * @module utils/source
 */

import { endTruncateStr } from "./utils";
import { basename } from "../utils/path";

import type { Source } from "../types";

/**
 * Trims the query part or reference identifier of a url string, if necessary.
 *
 * @memberof utils/source
 * @static
 */
function trimUrlQuery(url: string): string {
  let length = url.length;
  let q1 = url.indexOf("?");
  let q2 = url.indexOf("&");
  let q3 = url.indexOf("#");
  let q = Math.min(
    q1 != -1 ? q1 : length,
    q2 != -1 ? q2 : length,
    q3 != -1 ? q3 : length
  );

  return url.slice(0, q);
}

/**
 * Returns true if the specified url and/or content type are specific to
 * javascript files.
 *
 * @return boolean
 *         True if the source is likely javascript.
 *
 * @memberof utils/source
 * @static
 */
function isJavaScript(url: ?string, contentType: string = ""): boolean {
  return (
    (url && /\.(jsm|js)?$/.test(trimUrlQuery(url))) ||
    contentType.includes("javascript")
  );
}

/**
 * @memberof utils/source
 * @static
 */
function isPretty(source: Source): boolean {
  return source.url ? /formatted$/.test(source.url) : false;
}

/**
 * @memberof utils/source
 * @static
 */
function getPrettySourceURL(url: ?string): string {
  if (!url) {
    url = "";
  }
  return `${url}:formatted`;
}

/**
 * @memberof utils/source
 * @static
 */
function getRawSourceURL(url: string): string {
  return url.replace(/:formatted$/, "");
}

function getFilenameFromURL(url: string) {
  url = getRawSourceURL(url || "");
  const name = basename(url) || "(index)";
  return endTruncateStr(name, 50);
}

/**
 * Show a source url's filename.
 * If the source does not have a url, use the source id.
 *
 * @memberof utils/source
 * @static
 */
function getFilename(source: Source) {
  let { url, id } = source;
  if (!url) {
    const sourceId = id.split("/")[1];
    return `SOURCE${sourceId}`;
  }

  return getFilenameFromURL(url);
}

const contentTypeModeMap = {
  "text/javascript": { name: "javascript" },
  "text/typescript": { name: "javascript", typescript: true },
  "text/coffeescript": "coffeescript",
  "text/typescript-jsx": {
    name: "jsx",
    base: { name: "javascript", typescript: true }
  },
  "text/jsx": "jsx",
  "text/x-elm": "elm",
  "text/x-clojure": "clojure",
  "text/wasm": { name: "text" },
  "text/html": { name: "htmlmixed" }
};

/**
 *
 * Returns Code Mirror mode for source content type
 * @param contentType
 * @return String
 * @memberof utils/source
 * @static
 */

function getMode(source: Source) {
  if (!source.text) {
    return { name: "text" };
  }

  const { contentType, text } = source;

  // // @flow or /* @flow */
  if (text.match(/^\s*(\/\/ @flow|\/\* @flow \*\/)/)) {
    return contentTypeModeMap["text/typescript"];
  }

  if (/script|elm|jsx|clojure|wasm|html/.test(contentType)) {
    if (contentType in contentTypeModeMap) {
      return contentTypeModeMap[contentType];
    }

    return contentTypeModeMap["text/javascript"];
  }

  // Use HTML mode for files in which the first non whitespace
  // character is `<` regardless of extension.
  const isHTMLLike = source.text.match(/^\s*</);
  if (isHTMLLike) {
    return { name: "htmlmixed" };
  }

  return { name: "text" };
}

export {
  isJavaScript,
  isPretty,
  getPrettySourceURL,
  getRawSourceURL,
  getFilename,
  getFilenameFromURL,
  getMode
};
