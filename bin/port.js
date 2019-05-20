/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/*

  Backport changes from the debugger directory for a given commit
  e.g. node bin/port.js --mc ../gecko-dev --sha 029877e0

*/


const path = require("path");
const minimist = require("minimist");
const fs = require("fs");
const chalk = require("chalk");
const shell = require("shelljs");

const {
  tools: {  copyFile }
} = require("devtools-launchpad/index");

const args = minimist(process.argv.slice(1), {
  string: ["mc", "sha"]
});

let mcPath = args.mc || "./firefox";
const sha = args.sha || null;

function exec(cmd) {
  return shell.exec(cmd, { silent: true });
}

function copyCommitFiles({mcModulePath, mcPath, projectPath}) {
  shell.cd(mcPath)

  const { stdout: files } = exec(`git diff-tree --no-commit-id --name-only -r ${sha}`);
  const dbgFiles = files.split("\n").filter(file => file.includes(mcModulePath))

  for (const file of dbgFiles) {
    const filePath = file.replace(mcModulePath,'')

    const mcFilePath = path.resolve(mcPath, file)
    const dbgFilePath = path.resolve(projectPath, filePath);
    try {
      if (fs.existsSync(mcFilePath)) {
        copyFile(mcFilePath, dbgFilePath, {})
      } else {
        fs.unlinkSync(dbgFilePath);
      }
    } catch (e) {
      console.log(e.message)
    }
  }
}

function start() {
  const projectPath = path.resolve(__dirname, "..");
  const mcModulePath = "devtools/client/debugger/";

  // resolving against the project path in case it's relative. If it's absolute
  // it will override whatever is in projectPath.
  mcPath = path.resolve(projectPath, mcPath);
  const config = {  mcPath, projectPath, mcModulePath };
  copyCommitFiles(config);
}

start();
