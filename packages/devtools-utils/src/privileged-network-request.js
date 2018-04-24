/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

function networkRequest(url: string, opts: any) {
  return fetch(url, {
    cache: opts.loadFromCache ? "default" : "no-cache",
  }).then(res => {
    if (res.status >= 200 && res.status < 300) {
      return res.text()
        .then(text => ({ content: text }));
    }
    return Promise.reject(`request failed with status ${res.status}`);
  });
}

module.exports = networkRequest;
