/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const babel = require("@babel/core");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
var shell = require("shelljs");
const minimist = require("minimist");
var chokidar = require("chokidar");

const feature = require("devtools-config");
const getConfig = require("./getConfig");

// Path to the mozilla-central clone is either passed via the --mc argument
// or read from the configuration.
const envConfig = getConfig();
feature.setConfig(envConfig);

function ignoreFile(file) {
  return file.match(/(mochitest)/) || fs.statSync(file).isDirectory();
}

function getFiles() {
  return [...glob.sync("./src/**/*", {}), ...glob.sync("./packages/**/*", {})].filter(file => !ignoreFile(file));
}

function copyFiles() {
  getFiles().forEach(file => {
    try {
      if (ignoreFile(file)) {
        console.log("IGNORING File: ", file);
        return;
      }

      console.log("COPYING File: ", file);

      const filePath = path.join(__dirname, "..", file);
      const code = fs.readFileSync(filePath, "utf8");

      shell.mkdir("-p", path.join(mcDebuggerPath, path.dirname(file)));
      fs.writeFileSync(path.join(mcDebuggerPath, file), code);
    } catch (e) {
      console.log(`Failed to copy: ${file}`);
      console.error(e);
    }
  });
}

const MOZ_BUILD_TEMPLATE = `# vim: set filetype=python:
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

DIRS += [
__DIRS__
]

CompiledModules(
__FILES__
)
`;

/**
 * Create the mandatory manifest file that should exist in each folder to
 * list files and subfolders that should be packaged in Firefox.
 */
function createMozBuildFiles() {
  const builds = {};

  getFiles()
    .filter(file => file.match(/.js$/))
    .filter(file => {
      if (file.match(/\/workers\.js/)) {
        return true;
      }

     // We exclude worker files because they are bundled and we include
     // worker/index.js files because are required by the debugger app in order
     // to communicate with the worker.
     if (file.match(/\/workers/)) {
       return file.match(/workers\/(\w|-)*\/index.js/);
     }

     return !file.match(/(test|types|packages)/)

   })
    .forEach(file => {
      // console.log(file)
      let dir = path.dirname(file);
      builds[dir] = builds[dir] || { files: [], dirs: [] };

      // Add the current file to its parent dir moz.build
      builds[dir].files.push(path.basename(file));

      // There should be a moz.build in every folder between the root and this
      // file. Climb up the folder hierarchy and make sure a each folder of the
      // chain is listing in its parent dir moz.build.
      while (path.dirname(dir) != ".") {
        const parentDir = path.dirname(dir);
        const dirName = path.basename(dir);

        builds[parentDir] = builds[parentDir] || { files: [], dirs: [] };
        if (!builds[parentDir].dirs.includes(dirName)) {
          builds[parentDir].dirs.push(dirName);
        }
        dir = parentDir;
      }
    });

  Object.keys(builds).forEach(build => {
    const { files, dirs } = builds[build];

    const buildPath = path.join(mcDebuggerPath, build);
    shell.mkdir("-p", buildPath);

    // Files and folders should be alphabetically sorted in moz.build
    const fileStr = files
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map(file => `    '${file}',`)
      .join("\n");

    const dirStr = dirs
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map(dir => `    '${dir}',`)
      .join("\n");

    const src = MOZ_BUILD_TEMPLATE.replace("__DIRS__", dirStr).replace(
      "__FILES__",
      fileStr
    );

    fs.writeFileSync(path.join(buildPath, "moz.build"), src);
  });
}

function watch() {
  console.log("[copy-modules] start watching");
  var watcher = chokidar.watch("./src").on("all", (event, path) => {});

  watcher.on("change", path => {
    console.log(`Updating ${path}`);
    copyFile(path);
  });
}

function start() {
  console.log("[copy-modules] start");

  console.log("[copy-modules] copying debugger modules");
  copyFiles();

  console.log("[copy-modules] creating moz.build files");
  //createMozBuildFiles();

  console.log("[copy-modules] done");
  if (shouldWatch) {
    watch();
  }
}

const args = minimist(process.argv.slice(1), {
  string: ["mc"],
  boolean: ["watch"]
});

const projectPath = path.resolve(__dirname, "..");
let mcPath = args.mc || feature.getValue("firefox.mcPath");
const mcDebuggerPath = path.join(mcPath, "devtools/client/debugger");
let shouldWatch = args.watch;

function run({ watch, mc }) {
  shouldWatch = watch;
  mcPath = path.join(mc, "devtools/client/debugger");
  start();
}

if (process.argv[1] == __filename) {
  start();
} else {
  module.exports = { run };
}
