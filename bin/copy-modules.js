/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const babel = require("@babel/core");
const glob = require("glob");
const fs = require("fs");
const path = require("path");
var shell = require("shelljs");

const geckoPath = "../gecko/devtools/client/debugger/new/";

const buildTpl = `# vim: set filetype=python:
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

const mappings = {
  "./source-editor": "devtools/client/sourceeditor/editor",
  "../editor/source-editor": "devtools/client/sourceeditor/editor",
  "./test-flag": "devtools/shared/flags",
  "./fronts-device": "devtools/shared/fronts/device",
  react: "devtools/client/shared/vendor/react",
  redux: "devtools/client/shared/vendor/redux",
  "react-dom": "devtools/client/shared/vendor/react-dom",
  lodash: "devtools/client/shared/vendor/lodash",
  immutable: "devtools/client/shared/vendor/immutable",
  "react-redux": "devtools/client/shared/vendor/react-redux",
  "prop-types": "devtools/client/shared/vendor/react-prop-types",

  "wasmparser/dist/WasmParser": "devtools/client/shared/vendor/WasmParser",
  "wasmparser/dist/WasmDis": "devtools/client/shared/vendor/WasmDis",

  // The excluded files below should not be required while the Debugger runs
  // in Firefox. Here, "devtools/shared/flags" is used as a dummy module.
  "../assets/panel/debugger.properties": "devtools/shared/flags",
  "devtools-connection": "devtools/shared/flags",
  "chrome-remote-interface": "devtools/shared/flags",
  "devtools-launchpad": "devtools/shared/flags"
};

const vendors = [
  "devtools-config",
  "fuzzaldrin-plus",
  "devtools-modules",
  "devtools-utils"
];

function transform(filePath) {
  const doc = fs.readFileSync(filePath, "utf8");
  const out = babel.transformSync(doc, {
    plugins: [
      "transform-flow-strip-types",
      "syntax-trailing-function-commas",
      "transform-class-properties",
      "transform-es2015-modules-commonjs",
      "@babel/plugin-proposal-object-rest-spread",
      "transform-react-jsx",
      ["./.babel/transform-mc", { mappings, vendors, filePath }]
    ]
  });

  return out.code;
}

function getFiles() {
  return glob.sync("./src/**/*.js", {}).filter(file => {
    return !file.match(/(\/fixtures|\/tests|vendors\.js)/);
  });
}

function transformSrc() {
  getFiles().forEach(file => {
    const filePath = path.join(__dirname, "..", file);
    const code = transform(filePath);
    shell.mkdir("-p", path.join(__dirname, "../out", path.dirname(file)));
    fs.writeFileSync(path.join(__dirname, "../out", file), code);
  });
}

function mozBuilds() {
  const builds = {};

  getFiles().forEach(file => {
    if (file.includes("search")) {
      console.log(file);
    }

    let dir = path.dirname(file);
    builds[dir] = builds[dir] || { files: [], dirs: [] };
    builds[dir].files.push(path.basename(file));
    let parentDir = path.dirname(dir);
    const directory = path.basename(dir);

    if (file.includes("search")) {
      console.log(parentDir);
    }

    builds[parentDir] = builds[parentDir] || { files: [], dirs: [] };
    if (!builds[parentDir].dirs.includes(directory)) {
      builds[parentDir].dirs.push(directory);
    }

    while (parentDir != ".") {
      parentDir = path.dirname(parentDir);
      dir = path.dirname(dir);
      const directoryName = path.basename(dir);

      builds[parentDir] = builds[parentDir] || { files: [], dirs: [] };

      if (parentDir.includes("search")) {
        console.log(parentDir, directoryName);
      }

      if (!builds[parentDir].dirs.includes(directoryName)) {
        builds[parentDir].dirs.push(directoryName);
      }
    }
  });

  Object.keys(builds).forEach(build => {
    const { files, dirs } = builds[build];

    const buildPath = path.join(__dirname, "../out", build);
    shell.mkdir("-p", buildPath);

    const fileStr = files
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map(file => `    '${file}',`)
      .join("\n");

    const dirStr = dirs
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map(dir => `    '${dir}',`)
      .join("\n");

    const src = buildTpl
      .replace("__DIRS__", dirStr)
      .replace("__FILES__", fileStr);

    fs.writeFileSync(path.join(buildPath, "moz.build"), src);
  });
}

shell.rm("-rf", "./out");
shell.mkdir("./out");
transformSrc();
mozBuilds();
shell.cp("-r", "./out/src", "../gecko/devtools/client/debugger/new/");

// const code = transform("./src/workers/parser/index.js");
// console.log(code.slice(0, 1000));
