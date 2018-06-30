
const copyAssets = require("./copy-assets")
const copyModules = require("./copy-modules")
const minimist = require("minimist");
const path = require("path");

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
  await copyAssets({ assets, mc, watch, symlink});

  // Debugger
  await copyModules({
    source: "./src/**/*.js",
    ignoreRegexp: /(\/fixtures|\/test|vendors\.js|types\.js|types\/)/,
    mcPath: path.join(mc, "devtools/client/debugger/new"),
    watch
  });

  // Reps
  await copyModules({
    source: "./packages/devtools-reps/src/**/*.js",
    ignoreRegexp: /(launchpad\/|test\/|tests\/|stubs\/|types\.js)/,
    mcPath: path.join(mc, "devtools/client/shared/components/reps/"),
    watch
  });
}

start();
