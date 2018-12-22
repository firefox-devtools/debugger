/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

const md5 = require("md5");

function originalToGeneratedId(originalId: string) {
  const match = originalId.match(/(.*)\/originalSource/);
  return match ? match[1] : "";
}

function generatedToOriginalId(generatedId: string, url: string) {
  return `${generatedId}/originalSource-${md5(url)}`;
}

function isOriginalId(id: string) {
  return !!id.match(/\/originalSource/);
}

function isGeneratedId(id: string) {
  return !isOriginalId(id);
}

/**
 * Trims the query part or reference identifier of a URL string, if necessary.
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

// Map suffix to content type.
const contentMap = {
  js: "text/javascript",
  jsm: "text/javascript",
  mjs: "text/javascript",
  ts: "text/typescript",
  tsx: "text/typescript-jsx",
  jsx: "text/jsx",
  vue: "text/vue",
  coffee: "text/coffeescript",
  elm: "text/elm",
  cljc: "text/x-clojure",
  cljs: "text/x-clojurescript"
};

/**
 * Returns the content type for the specified URL.  If no specific
 * content type can be determined, "text/plain" is returned.
 *
 * @return String
 *         The content type.
 */
function getContentType(url: string) {
  url = trimUrlQuery(url);
  const dot = url.lastIndexOf(".");
  if (dot >= 0) {
    const name = url.substring(dot + 1);
    if (name in contentMap) {
      return contentMap[name];
    }
  }
  return "text/plain";
}

module.exports = {
  originalToGeneratedId,
  generatedToOriginalId,
  isOriginalId,
  isGeneratedId,
  getContentType,
  contentMapForTesting: contentMap
};
