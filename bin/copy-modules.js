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


function ignoreFile(file) {
  return file.match(/(\/stubs|\/test|\/launchpad)/);
}

function getFiles() {
  return glob.sync(`${ghRepsPath}/**/*.js`, {}).filter((file) => !ignoreFile(file));
}

function getMcFilePath(filePath) {
  return path.join(__dirname, '..', mcRepsPath, path.relative(ghRepsPath, filePath));
}

function transformSingleFile(filePath, doc) {
  const out = babel.transformSync(doc, {
    plugins: [
      "transform-flow-strip-types",
      "syntax-trailing-function-commas",
      "transform-class-properties",
      "babel-plugin-syntax-object-rest-spread",
       "transform-react-jsx",
      ["./.babel/transform-mc", { filePath }]
    ]
  });

  return out.code;
}

function transpileFile(file) {
  try {
    if (ignoreFile(file)) {
      return;
    }

    // const filePath = path.join(__dirname, "..", file);
    const doc = fs.readFileSync(file, "utf8");

    let code = transformSingleFile(file, doc);
    code = MOZ_MODULE_TEMPLATE.replace(/__FILE__/, code)
    const mcFilePath = getMcFilePath(file)
    shell.mkdir("-p", path.dirname(mcFilePath));
    fs.writeFileSync(mcFilePath, code);
    // console.log(code)
  } catch (e) {
    console.log(`Failed to transpile: ${file}`)
    console.error(e);
  }
}

function transpileFiles() {
  getFiles().forEach(transpileFile);
}

const MOZ_MODULE_TEMPLATE = `
/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Make this available to both AMD and CJS environments
define(function (require, exports, module) {
__FILE__
})
`

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
function createMozBuildFiles() {
  const builds = {};

  getFiles().forEach(file => {
    const mcFile = './'+path.relative(mcPath, getMcFilePath(file));
    // console.log(mcFile)
    let dir = path.dirname(mcFile);
    builds[dir] = builds[dir] || { files: [], dirs: [] };

    // Add the current file to its parent dir moz.build
    builds[dir].files.push(path.basename(mcFile));

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
  // return;

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

    console.log(path.join(buildPath, "moz.build"))
    fs.writeFileSync(path.join(buildPath, "moz.build"), src);
  });
}

function watch() {
  console.log("[copy-modules] start watching");
  var watcher = chokidar.watch('./src').on('all', (event, path) => {});

  watcher
  .on('change', path => {
    console.log(`Updating ${path}`)
    transpileFile(path)
  })

}

function start() {
  console.log("[copy-modules] start");

  console.log("[copy-modules] transpiling reps modules");
  transpileFiles();

  console.log("[copy-modules] creating moz.build files");
  createMozBuildFiles();

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
let ghRepsPath = path.join(projectPath, "packages/devtools-reps/src/")
let mcPath = args.mc || feature.getValue("firefox.mcPath");
let mcRepsPath = path.join(mcPath, "devtools/client/shared/components/reps");
let shouldWatch = args.watch;

function run({watch, mc}) {
  shouldWatch = watch
  start();
}

if (process.argv[1] == __filename) {
  start();
} else {
  module.exports = {
    run,
    transformSingleFile
  }
}
