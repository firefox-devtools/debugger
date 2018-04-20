/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

module.exports = function(wallaby) {
  return {
    files: [
      { pattern: "node_modules/workerjs/**", instrument: false },
      { pattern: "src/test/fixtures/*.js" },
      { pattern: "src/**/fixtures/*.+(js|html|json)", instrument: false },
      { pattern: "src/test/__mocks__/**", instrument: false },
      { pattern: "src/**/*.js" },
      { pattern: "!src/test/integration/**" },
      { pattern: "!src/test/mochitest/**" },
      { pattern: "!src/**/tests/*.js" },
      { pattern: "src/**/*.snap", instrument: false },
      { pattern: "bin/*.js" },
      { pattern: "configs/*.json", instrument: false },
      { pattern: "assets/images/Svg.js" },
      { pattern: "assets/**", instrument: false }
    ],
    tests: [{ pattern: "!src/test/**" }, { pattern: "src/**/tests/*.js" }],
    env: {
      type: "node",
      runner: "node"
    },
    testFramework: "jest",
    reportUnhandledPromises: false,
    compilers: {
      "+(src|assets)/**/*.js": wallaby.compilers.babel()
    },
    preprocessors: {
      "node_modules/workerjs/requireworker.js": f =>
        `${f.content.replace(
          "(modulePath) {",
          `(modulePath) {modulePath=modulePath.replace(${JSON.stringify(
            wallaby.projectCacheDir
          )}, ${JSON.stringify(wallaby.localProjectDir)});`
        )}\nglobal.$_$wpe = global.$_$wp = ` +
        "global.$_$wf = global.$_$w = global.$_$wv = () => {};" +
        " global.$_$tracer = { log: () => {} };"
    },
    debug: true
  };
};
