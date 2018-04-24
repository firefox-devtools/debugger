/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  tools: { makeBundle }
} = require("devtools-launchpad/index");
const path = require("path");
const minimist = require("minimist");
const getConfig = require("./getConfig");
const { getValue, setConfig } = require("devtools-config");

const args = minimist(process.argv.slice(2), {
  boolean: ["watch", "symlink"]
});

function start() {
  console.log("start: copy assets");
  process.env.NODE_ENV = "production";
  const projectPath = path.resolve(__dirname, "..");
  const mcModulePath = "devtools/client/shared/components/reps";

  const envConfig = getConfig();
  setConfig(envConfig);

  const mcPath = getValue("firefox.mcPath");
  const shouldSymlink = args.symlink;

  if (mcPath !== "./firefox" && shouldSymlink) {
    console.error("Aborting copy-assets...");
    console.error("[--symlink] option only available if mcPath is `./firefox`");
    return;
  }

  console.log("  output path is:", mcPath);
  console.log("  creating reps.js bundle...");

  makeBundle({
    outputPath: path.join(mcPath, mcModulePath),
    projectPath,
    watch: args.watch
  })
    .then(() => {
      console.log("done: copy assets");
    })
    .catch(e => {
      console.error(e);
    });
}

start();
