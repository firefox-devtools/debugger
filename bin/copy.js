
const copyAssets = require("./copy-assets")
const copyModules = require("./copy-modules")
const minimist = require("minimist");
const fs = require("fs");
const chalk = require("chalk");

const args = minimist(process.argv.slice(1), {
  string: ["mc"],
  boolean: ["watch", "symlink", "assets"]
});

const mc = args.mc || "./firefox";
const watch = args.watch;
const symlink = args.symlink;
const assets = args.assets

console.log(`Copying Files to ${mc} with params: `, {watch, assets, symlink})

async function start() {
  if (fs.existsSync(mc)) {
    try {
      await copyAssets({ assets, mc, watch, symlink})
      await copyModules.run({ mc, watch })
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

function missingFilesErrorMessage() {
  let errorMessage = [
    'It looks like you are missing some files. The mozilla-central ',
    'codebase may be missing at ${mc}. You can clone mozilla-central by ',
    'running \`./bin/prepare-mochitests-dev\` from the root of the ',
    'debugger.html repository. You can find more information on bundling ',
    'or mochitests at ',
    'https://github.com/devtools-html/debugger.html/blob/master/docs/bundling.md or ',
    'https://github.com/devtools-html/debugger.html/blob/master/docs/mochitests.md'
  ].join('');

  console.warn(chalk.yellow(errorMessage));
}

start();
