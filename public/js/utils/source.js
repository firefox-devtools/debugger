
/**
 * Trims the query part or reference identifier of a url string, if necessary.
 *
 * @param string url - The source url.
 * @return string - The shortened url.
 */
function trimUrlQuery(url) {
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
function isJavaScript(url, contentType = "") {
  return (url && /\.jsm?$/.test(trimUrlQuery(url))) ||
         contentType.includes("javascript");
}

function isPretty(source) {
  return source.url.match(/formatted$/);
}

module.exports = {
  isJavaScript,
  isPretty
};
