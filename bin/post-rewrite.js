/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// This is either 'rebase' or 'amend'.
if (process.env.GIT_PARAMS !== "rebase") {
  process.exit();
}

const checkWarnYarnChanged = require("./check-warn-yarn-changed.js");

const { createInterface } = require("readline");

const rl = createInterface({
  input: process.stdin
});

rl.on("line", line => {
  const [origHead, head] = line.split(" ");
  checkWarnYarnChanged(origHead, head).then(
    changed => changed && process.exit()
  );
});
