/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Rewrite all the require("lodash/foo") to require("lodash").foo
 *
 * This will allow to reuse the vendored lodash package from mozilla-central
 * when running in Firefox.
 */
module.exports = function(content) {
  this.cacheable && this.cacheable();

  const lodashRequireRegexp = /require\("lodash\/([a-zA-Z]+)"\)/g;
  return content.replace(lodashRequireRegexp, 'require("lodash").$1');
};
