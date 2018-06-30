/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const babel = require("@babel/core");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
var shell = require("shelljs");
const minimist = require("minimist");
var chokidar = require('chokidar');


const feature = require("devtools-config");
const getConfig = require("./getConfig");

// Path to the mozilla-central clone is either passed via the --mc argument
// or read from the configuration.
const envConfig = getConfig();
feature.setConfig(envConfig);

function ignoreFile(file, ignoreRegexp) {
  return file.match(ignoreRegexp);
}

function getFiles(source, ignoreRegexp) {
  return glob.sync(source, {}).filter(file => !ignoreFile(file, ignoreRegexp));
}

function transformSingleFile(filePath) {
  const doc = fs.readFileSync(filePath, "utf8");
  const out = babel.transformSync(doc, {
    plugins: [
      "transform-flow-strip-types",
      "syntax-trailing-function-commas",
      "transform-class-properties",
      "transform-es2015-modules-commonjs",
      "babel-plugin-syntax-object-rest-spread",
      "transform-react-jsx",
      ["./.babel/transform-mc", { filePath }],
      ["babel-plugin-transform-require-ignore", { "extensions": ".css"}]
    ]
  });

  return out.code;
}

function cleanPath(p) {
  if (p.includes("packages/devtools-reps/")) {
    return p.replace("packages/devtools-reps/", "");
  }

  return p;
}

function transpileFile({file, mcPath, ignoreRegexp}) {
  try {
    if (ignoreFile(file, ignoreRegexp)) {
      return;
    }

    const filePath = path.join(__dirname, "..", file);
    const code = transformSingleFile(filePath);
    shell.mkdir("-p", cleanPath(path.join(mcPath, path.dirname(file))));
    fs.writeFileSync(cleanPath(path.join(mcPath, file)), code);
  } catch (e) {
    console.log(`Failed to transpile: ${file}`)
    console.error(e);
  }
}

function transpileFiles({source, mcPath, ignoreRegexp}) {
  getFiles(source, ignoreRegexp)
    .forEach(file => transpileFile({file, mcPath, ignoreRegexp}));
}

const MOZ_BUILD_TEMPLATE = `# vim: set filetype=python:
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

DIRS += [
__DIRS__
]

DevToolsModules(
__FILES__
)
`;

/**
 * Create the mandatory manifest file that should exist in each folder to
 * list files and subfolders that should be packaged in Firefox.
 */
function createMozBuildFiles({source, ignoreRegexp, mcPath}) {
  const builds = {};

  getFiles(source, ignoreRegexp).forEach(file => {
    let dir = cleanPath(path.dirname(file));
    builds[dir] = builds[dir] || { files: [], dirs: [] };

    // Add the current file to its parent dir moz.build
    builds[dir].files.push(cleanPath(path.basename(file)));

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

    const buildPath = path.join(mcPath, build);
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

    const src = MOZ_BUILD_TEMPLATE
      .replace("__DIRS__", dirStr)
      .replace("__FILES__", fileStr);

    fs.writeFileSync(path.join(buildPath, "moz.build"), src);
  });
}

function watch(mcPath, ignoreRegexp) {
  console.log("[copy-modules] start watching");
  var watcher = chokidar.watch('./src').on('all', (event, path) => {});

  watcher.on('change', file => {
    console.log(`Updating ${file}`)
    transpileFile({file, mcPath, ignoreRegexp})
  });
}

function start({source, mcPath, shouldWatch, ignoreRegexp}) {
  const log = str => console.log(`[copy-modules ${mcPath}] ${str}`);

  log(`start`);
  log("transpiling modules");
  transpileFiles({source, mcPath, ignoreRegexp});

  log("creating moz.build files");
  createMozBuildFiles({source, ignoreRegexp, mcPath});

  log("done");
  if (shouldWatch) {
    watch(mcPath, ignoreRegexp);
  }
}

const args = minimist(process.argv.slice(1), {
  string: ["mc"],
  boolean: ["watch"]
});

const projectPath = path.resolve(__dirname, "..");

if (process.argv[1] == __filename) {
  start({
    mcPath: args.mc || feature.getValue("firefox.mcPath"),
    source: args.source,
    shouldWatch: args.watch,
    ignoreRegexp: args.ignoreRegexp,
  });
} else {
  module.exports = ({watch, mcPath, source, ignoreRegexp}) => {
    start({
      mcPath,
      source,
      shouldWatch: watch,
      ignoreRegexp,
    });
  }
}
