
const copyAssets = require("./copy-assets")
const copyModules = require("./copy-modules")
const minimist = require("minimist");

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
  await copyAssets({ assets, mc, watch, symlink})
  await copyModules.run({ mc, watch })
}

start();
