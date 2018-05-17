/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { resolve } = require("path");
const root = resolve(__dirname, "..");
module.exports = {
  rootDir: root,
  displayName: "prettier",
  runner: "jest-runner-write-prettier",
  testMatch: [
    "<rootDir>/src/**/*.js",
    "<rootDir>src/components/**/*.css",
    "<rootDir>/packages/*/src/**/*.js",
    "*.json"
  ],
  moduleFileExtensions: ["css", "js", "json"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/src/actions/tests/fixtures/",
    "<rootDir>/src/workers/parser/tests/fixtures/",
    "<rootDir>/src/test/mochitest/examples/",
    "<rootDir>/packages/devtools-source-map/src/tests/fixtures/"
  ]
};
