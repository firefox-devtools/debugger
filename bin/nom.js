/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
const rimraf = require("rimraf");
const spawn = require("child_process").spawn;

function start() {
  console.log("Deleting node_modules and yarn.lock");
  rimraf("{node_modules,yarn.lock}", {}, () => {
    console.log("Reinstalling packages");
    spawn("yarn install", { shell: true, stdio: "inherit" });
  });
}

start();
