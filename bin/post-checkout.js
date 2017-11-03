/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
const [origHead, head, flag] = process.env.GIT_PARAMS.split(" ");

// Flag is 1 if we moved between branches. Flag is 0 if we merely checked out a file from another branch.
if (flag !== "1") {
  process.exit();
}

require("./check-warn-yarn-changed.js")(origHead, head);
