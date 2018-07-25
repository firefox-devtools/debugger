"use strict";

const path = require("path");
const util = require("util");
const _ = require("lodash");
const rollup = require("rollup");
const rollupBabel = require("rollup-plugin-babel");

module.exports = exports = async function(tests, dirname) {
  const fixtures = [];
  for (const [ name, input ] of tests) {
    if (!/rollup-/.test(name) || /babel-/.test(name)) continue;

    const testFnName = _.camelCase(name);

    const scriptPath = path.join(path.dirname(input), "output.js");

    const bundle = await rollup.rollup({
      input: "fake-bundle-root",
      plugins: [
        // Our input file may export more than the default, but we
        // want to enable 'exports: "default",' so we need the root
        // import to only have a default export.
        {
          resolveId: id => id === "fake-bundle-root" ? id : undefined,
          load: id => id === "fake-bundle-root"
            ? `import test from "${input}"; export default test;`
            : undefined,
        },
        {
          ongenerate(bundle, data) {
            data.map.sources = data.map.sources.map(name => name.replace(/^fixtures[\\/]/, "fixtures://./"));
          },
        }
      ].filter(Boolean),
    });

    await bundle.write({
      file: path.basename(scriptPath),
      dir: path.dirname(scriptPath),
      format: "iife",
      name: testFnName,
      // sourceMapFile: ""
      sourcemap: true,
      exports: "default",
    });

    console.log("Build " + name);

    fixtures.push({
      name,
      testFnName,
      scriptPath,
      assets: [
        scriptPath,
        scriptPath + ".map",
      ]
    });
  }

  return fixtures;
}
