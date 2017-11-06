/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// MIT © Sindre Sorhus - sindresorhus.com
// via https://gist.github.com/sindresorhus/7996717

const { execFile } = require("child_process");

module.exports = function checkWarnIfYarnChanged(origHead, head) {
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      ["diff-tree", "-r", "--name-only", "--no-commit-id", origHead, head],
      (error, stdout, stderr) => {
        if (error) {
          console.error("stderr", stderr);
          reject(error);
          return;
        }
        if (stdout.includes("yarn.lock")) {
          console.log("🎅 yarn.lock changed; RUN: yarn install");
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
};
