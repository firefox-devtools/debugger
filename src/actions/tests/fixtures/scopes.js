/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Program Scope

function outer() {
  function inner() {
    const x = 1;
  }

  const declaration = function() {
    const x = 1;
  };
}
