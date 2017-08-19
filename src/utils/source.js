// @flow

/**
 * Utils for working with Source URLs
 * @module utils/source
 */

import { isOriginalId } from "devtools-source-map";
import { endTruncateStr } from "./utils";
import { basename } from "../utils/path";
import { parse as parseURL } from "url";

import type { Source } from "../types";

/**
 * Trims the query part or reference identifier of a url string, if necessary.
 *
 * @memberof utils/source
 * @static
 */
function trimUrlQuery(url: string): string {
  const length = url.length;
  const q1 = url.indexOf("?");
  const q2 = url.indexOf("&");
  const q3 = url.indexOf("#");
  const q = Math.min(
    q1 != -1 ? q1 : length,
    q2 != -1 ? q2 : length,
    q3 != -1 ? q3 : length
  );

  return url.slice(0, q);
}

function shouldPrettyPrint(source: any) {
  if (!source) {
    return false;
  }

  const _isPretty = isPretty(source);
  const _isJavaScript = isJavaScript(source.url);
  const isOriginal = isOriginalId(source.id);
  const hasSourceMap = source.sourceMapURL;

  if (_isPretty || isOriginal || hasSourceMap || !_isJavaScript) {
    return false;
  }

  return true;
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
  const { url, id } = source;
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

function getSourcePath(source: Source) {
  if (!source.url) {
    return "";
  }

  const { path, href } = parseURL(source.url);
  // for URLs like "about:home" the path is null so we pass the full href
  return path || href;
}

/**
 * Returns amount of lines in the source. If source is a WebAssembly binary,
 * the function returns amount of bytes.
 */
function getSourceLineCount(source: Source) {
  if (source.isWasm) {
    const { binary } = (source.text: any);
    return binary.length;
  }
  return source.text != undefined ? source.text.split("\n").length : 0;
}

/**
 *
 * Returns Code Mirror mode for source content type
 * @param contentType
 * @return String
 * @memberof utils/source
 * @static
 */

function getMode(source: Source) {
  const { contentType, text, isWasm, url } = source;

  if (!text || isWasm) {
    return { name: "text" };
  }

  // if the url ends with .marko we set the name to Javascript so
  // syntax highlighting works for marko too
  if (url.match(/\.marko$/i)) {
    return { name: "javascript" };
  }

  // Use HTML mode for files in which the first non whitespace
  // character is `<` regardless of extension.
  const isHTMLLike = text.match(/^\s*</);
  if (!contentType) {
    if (isHTMLLike) {
      return { name: "htmlmixed" };
    }
    return { name: "text" };
  }

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

  if (isHTMLLike) {
    return { name: "htmlmixed" };
  }

  return { name: "text" };
}

function isLoaded(source: Source) {
  return source.loadedState === "loaded";
}

export {
  isJavaScript,
  isPretty,
  shouldPrettyPrint,
  getPrettySourceURL,
  getRawSourceURL,
  getFilename,
  getFilenameFromURL,
  getSourcePath,
  getSourceLineCount,
  getMode,
  isLoaded
};
