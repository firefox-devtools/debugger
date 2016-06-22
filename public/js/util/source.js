"use strict";

/**
 * Returns true if the specified url and/or content type are specific to
 * javascript files.
 *
 * @return boolean
 *         True if the source is likely javascript.
 */
function isJavaScript(aUrl, aContentType = "") {
  return (aUrl && /\.jsm?$/.test(this.trimUrlQuery(aUrl))) ||
         aContentType.includes("javascript");
}

module.exports = {
  isJavaScript
}
