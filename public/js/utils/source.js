// @flow

/**
 * Trims the query part or reference identifier of a url string, if necessary.
 */
function trimUrlQuery(url: string): string {
  let length = url.length;
  let q1 = url.indexOf("?");
  let q2 = url.indexOf("&");
  let q3 = url.indexOf("#");
  let q = Math.min(q1 != -1 ? q1 : length,
                   q2 != -1 ? q2 : length,
                   q3 != -1 ? q3 : length);

  return url.slice(0, q);
}

/**
 * Returns true if the specified url and/or content type are specific to
 * javascript files.
 *
 * @return boolean
 *         True if the source is likely javascript.
 */
function isJavaScript(url: string, contentType: string = ""): boolean {
  return (url && /\.(jsm|js)?$/.test(trimUrlQuery(url))) ||
         contentType.includes("javascript");
}

// TODO: This should use a shared Source type
function isPretty(source: {url: string}): boolean {
  return source.url ? /formatted$/.test(source.url) : false;
}

module.exports = {
  isJavaScript,
  isPretty
};
