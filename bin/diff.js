/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
const exec = require("child_process").exec;
const ncp = require("copy-paste");
function diff() {
  exec("git diff", (err, gitDiff) => {
    if (err) {
      console.error(err);
    } else {
      ncp.copy("```diff\n" + gitDiff + "```", () => {
        console.log("copied diff to clipboard");
      });
    }
  });
}

diff();
