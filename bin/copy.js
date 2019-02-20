/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/*
 * copy files to mc
 * node ./bin/copy --mc ../gecko-dev
 *
 * copy files per commit
 * node ./bin/copy --mc ../gecko-dev --sha 123
 *
 * copy files per commit with a message
 * node ./bin/copy --mc ../gecko-dev --sha 123 --message "bug 123 (release 106) __message__.r=dwalsh"
 */

const copyAssets = require("./copy-assets");
const copyModules = require("./copy-modules");
const minimist = require("minimist");
const fs = require("fs");
const chalk = require("chalk");
const shell = require("shelljs");
const path = require("path");

const args = minimist(process.argv.slice(1), {
  string: ["mc", "sha", "message"],
  boolean: ["watch", "symlink", "assets"]
});

const mc = args.mc || "./firefox";
const watch = args.watch;
const symlink = args.symlink;
const assets = args.assets;
const sha = args.sha;
const message = args.message || "";

const mcPath = path.join(__dirname, mc);

async function copy({ assets, mc, watch, symlink }) {
  if (fs.existsSync(mc)) {
    try {
      await copyAssets({ assets, mc, watch, symlink });
      await copyModules.run({ mc, watch });
    } catch (e) {
      console.error(e);
      if (e.code === "ENOENT") {
        missingFilesErrorMessage();
      }
    }
  } else {
    missingFilesErrorMessage();
  }
}

async function start() {
  console.log(`Copying Files to ${mc} with params: `, {
    watch,
    assets,
    symlink
  });
  return copy({ watch, assets, mc, symlink });
}

function missingFilesErrorMessage() {
  const errorMessage = [
    "It looks like you are missing some files. The mozilla-central ",
    "codebase may be missing at ${mc}. You can clone mozilla-central by ",
    "running `./bin/prepare-mochitests-dev` from the root of the ",
    "debugger.html repository. You can find more information on bundling ",
    "or mochitests at ",
    "https://github.com/firefox-devtools/debugger/blob/master/docs/bundling.md or ",
    "https://github.com/firefox-devtools/debugger/blob/master/docs/mochitests.md"
  ].join("");

  console.warn(chalk.yellow(errorMessage));
}

async function copyCommits() {
  function exec(cmd) {
    return shell.exec(cmd, { silent: true }).stdout;
  }

  function getMessage(sha) {
    const msg = exec(`git log --format=%B -n 1 ${sha}`).split("\n")[0]
    return message.replace('__message__', msg);
  }

  function getCommitsAfter(sha) {
    return exec(`git rev-list --reverse ${sha}^..HEAD`)
      .trim()
      .split("\n");
  }

  function commitChanges(message, authorship) {
    exec(
      `git add devtools; git commit --author="${authorship}" -m "${message}"`
    );
  }

  const commits = getCommitsAfter(sha);
  for (const commit of commits) {
    const message = getMessage(commit);
    console.log(`Copying ${message}`);
    exec(`git checkout ${commit}`);
    const authorship = exec('git log -n1 --format="%aN <%aE>"');

    await copy({ mc, assets: true });
    shell.cd(mc);
    commitChanges(message, authorship);
    shell.cd("-");
    exec("git checkout .");
  }
}

if (sha) {
  copyCommits();
} else {
  start();
}
