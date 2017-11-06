/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;

function getGitSha() {
  return new Promise((resolve, reject) => {
    const proc = spawn("git", ["log", "--format=%H", "-n", "1"]);

    let version = "";

    proc.stdout.on("data", data => {
      version += data;
    });
    proc.on("close", code => resolve(version.trim()));
    proc.on("error", error => {
      if (error.code == "ENOENT") {
        reject(new Error("Could not find git."));
        return;
      }
      reject(error);
    });
  });
}

function getPackageVersion(name) {
  try {
    const json = require(`${name}/package.json`);
    const { version } = json;
    return { name, version };
  } catch (ex) {
    return { name, version: "n/a" };
  }
}

const packageOfInterest = [
  "babel-plugin-transform-es2015-modules-commonjs",
  "babel-preset-react",
  "react",
  "react-dom",
  "webpack"
];

function getInterestingPackagesVersions() {
  return Promise.all(packageOfInterest.map(p => getPackageVersion(p)));
}

function writeReadme(target) {
  const buffer = [
    "This is the debugger.html project output.",
    "See https://github.com/devtools-html/debugger.html",
    ""
  ];
  return getGitSha()
    .then(sha => {
      buffer.push(`Taken from upstream commit: ${sha}`, "");
      return getInterestingPackagesVersions();
    })
    .then(packagesVersions => {
      buffer.push("Packages:");
      packagesVersions.forEach(({ name, version }) => {
        buffer.push(`- ${name} @${version}`);
      }, this);
      buffer.push("");
    })
    .then(() => {
      fs.writeFileSync(target, buffer.join("\n"));
    });
}

module.exports = writeReadme;
