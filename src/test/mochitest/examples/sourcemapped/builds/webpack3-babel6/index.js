"use strict";

const path = require("path");
const util = require("util");
const _ = require("lodash");
const webpack = require("webpack");

module.exports = exports = async function(tests, dirname) {
  const fixtures = [];
  for (const [ name, input ] of tests) {
    if (/rollup-/.test(name) || !/babel-/.test(name)) continue;

    const testFnName = _.camelCase(name);
    const evalMaps = name.match(/-eval/);
    const babelEnv = !name.match(/-es6/);
    const babelModules = name.match(/-cjs/);

    const scriptPath = path.join(path.dirname(input), "output.js");
    const result = await util.promisify(webpack)({
      context: path.dirname(input),
      entry: "./" + path.basename(input),
      output: {
        path: path.dirname(scriptPath),
        filename: path.basename(scriptPath),

        devtoolModuleFilenameTemplate: `fixtures://./${name}/[resource-path]`,

        libraryTarget: "var",
        library: testFnName,
        libraryExport: "default"
      },
      devtool: evalMaps ? "eval-source-map" : "source-map",
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: require.resolve("babel-loader"),
            options: {
              babelrc: false,
              presets: [
                babelEnv
                  ? [require.resolve("babel-preset-env"), { modules: babelModules ? "commonjs" : false }]
                  : null,
              ].filter(Boolean),
              plugins: [
                require.resolve("babel-plugin-transform-flow-strip-types"),
              ],
            },
          },
        ].filter(Boolean)
      }
    });

    console.log(result.toString());

    fixtures.push({
      name,
      testFnName: testFnName,
      scriptPath,
      assets: [
        scriptPath,
        evalMaps ? null : scriptPath + ".map",
      ].filter(Boolean),
    });
  }

  return fixtures;
}
