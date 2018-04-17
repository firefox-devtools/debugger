/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Utils for working with Source URLs
 * @module utils/source
 */

import { isOriginalId } from "devtools-source-map";
import { endTruncateStr } from "./utils";
import { basename } from "./path";

import { parse as parseURL } from "url";
export { isMinified } from "./isMinified";
import { getExtension } from "./sources-tree";

import type { Source, SourceRecord, Location } from "../types";
import type { SymbolDeclarations } from "../workers/parser";

type transformUrlCallback = string => string;

export const sourceTypes = {
  coffee: "coffeescript",
  js: "javascript",
  jsx: "react",
  ts: "typescript"
};

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

export function shouldPrettyPrint(source: SourceRecord) {
  if (!source) {
    return false;
  }
  const _isPretty = isPretty(source);
  const _isJavaScript = isJavaScript(source);
  const isOriginal = isOriginalId(source.id);
  const hasSourceMap = source.get("sourceMapURL");

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
export function isJavaScript(source: SourceRecord): boolean {
  const url = source.url;
  const contentType = source.contentType;
  return (
    (url && /\.(jsm|js)?$/.test(trimUrlQuery(url))) ||
    !!(contentType && contentType.includes("javascript"))
  );
}

/**
 * @memberof utils/source
 * @static
 */
export function isPretty(source: SourceRecord): boolean {
  const url = source.url;
  return isPrettyURL(url);
}

export function isPrettyURL(url: string): boolean {
  return url ? /formatted$/.test(url) : false;
}

export function isThirdParty(source: SourceRecord) {
  const url = source.url;
  if (!source || !url) {
    return false;
  }

  return !!url.match(/(node_modules|bower_components)/);
}

/**
 * @memberof utils/source
 * @static
 */
export function getPrettySourceURL(url: ?string): string {
  if (!url) {
    url = "";
  }
  return `${url}:formatted`;
}

/**
 * @memberof utils/source
 * @static
 */
export function getRawSourceURL(url: string): string {
  return url ? url.replace(/:formatted$/, "") : url;
}

function resolveFileURL(
  url: string,
  transformUrl: transformUrlCallback = initialUrl => initialUrl
) {
  url = getRawSourceURL(url || "");
  const name = transformUrl(url);
  return endTruncateStr(name, 50);
}

export function getFilenameFromURL(url: string) {
  return resolveFileURL(url, initialUrl => basename(initialUrl) || "(index)");
}

export function getFormattedSourceId(id: string) {
  const sourceId = id.split("/")[1];
  return `SOURCE${sourceId}`;
}

/**
 * Show a source url's filename.
 * If the source does not have a url, use the source id.
 *
 * @memberof utils/source
 * @static
 */
export function getFilename(source: Source) {
  const { url, id } = source;
  if (!url) {
    return getFormattedSourceId(id);
  }

  let filename = getFilenameFromURL(url);
  const qMarkIdx = filename.indexOf("?");
  if (qMarkIdx > 0) {
    filename = filename.slice(0, qMarkIdx);
  }
  return filename;
}

/**
 * Show a source url.
 * If the source does not have a url, use the source id.
 *
 * @memberof utils/source
 * @static
 */
export function getFileURL(source: Source) {
  const { url, id } = source;
  if (!url) {
    return getFormattedSourceId(id);
  }

  return resolveFileURL(url);
}

const contentTypeModeMap = {
  "text/javascript": { name: "javascript" },
  "text/typescript": { name: "javascript", typescript: true },
  "text/coffeescript": { name: "coffeescript" },
  "text/typescript-jsx": {
    name: "jsx",
    base: { name: "javascript", typescript: true }
  },
  "text/jsx": { name: "jsx" },
  "text/x-elm": { name: "elm" },
  "text/x-clojure": { name: "clojure" },
  "text/wasm": { name: "text" },
  "text/html": { name: "htmlmixed" }
};

export function getSourcePath(url: string) {
  if (!url) {
    return "";
  }

  const { path, href } = parseURL(url);
  // for URLs like "about:home" the path is null so we pass the full href
  return path || href;
}

/**
 * Returns amount of lines in the source. If source is a WebAssembly binary,
 * the function returns amount of bytes.
 */
export function getSourceLineCount(source: Source) {
  if (source.isWasm && !source.error) {
    const { binary } = (source.text: any);
    return binary.length;
  }
  return source.text != undefined ? source.text.split("\n").length : 0;
}

/**
 *
 * Checks if a source is minified based on some heuristics
 * @param key
 * @param text
 * @return boolean
 * @memberof utils/source
 * @static
 */

/**
 *
 * Returns Code Mirror mode for source content type
 * @param contentType
 * @return String
 * @memberof utils/source
 * @static
 */

export function getMode(
  source: Source,
  symbols?: SymbolDeclarations
): { name: string } {
  const { contentType, text, isWasm, url } = source;

  if (!text || isWasm) {
    return { name: "text" };
  }

  if ((url && url.match(/\.jsx$/i)) || (symbols && symbols.hasJsx)) {
    if (symbols && symbols.hasTypes) {
      return { name: "text/typescript-jsx" };
    }
    return { name: "jsx" };
  }

  if (symbols && symbols.hasTypes) {
    if (symbols.hasJsx) {
      return { name: "text/typescript-jsx" };
    }

    return { name: "text/typescript" };
  }

  const languageMimeMap = [
    { ext: ".c", mode: "text/x-csrc" },
    { ext: ".kt", mode: "text/x-kotlin" },
    { ext: ".cpp", mode: "text/x-c++src" },
    { ext: ".m", mode: "text/x-objectivec" },
    { ext: ".rs", mode: "text/x-rustsrc" }
  ];

  // check for C and other non JS languages
  if (url) {
    const result = languageMimeMap.find(({ ext }) => url.endsWith(ext));

    if (result !== undefined) {
      return { name: result.mode };
    }
  }

  // if the url ends with .marko we set the name to Javascript so
  // syntax highlighting works for marko too
  if (url && url.match(/\.marko$/i)) {
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

export function isLoaded(source: SourceRecord) {
  return source.get("loadedState") === "loaded";
}

export function isLoading(source: SourceRecord) {
  return source.get("loadedState") === "loading";
}

export function getTextAtPosition(source: Source, location: Location) {
  if (!source || !source.text) {
    return "";
  }

  const line = location.line;
  const column = location.column || 0;

  const lineText = source.text.split("\n")[line - 1];
  if (!lineText) {
    return "";
  }

  return lineText.slice(column, column + 100).trim();
}

export function getSourceClassnames(source: Object) {
  if (source && source.isBlackBoxed) {
    return "blackBox";
  }

  return sourceTypes[getExtension(source)] || "file";
}
