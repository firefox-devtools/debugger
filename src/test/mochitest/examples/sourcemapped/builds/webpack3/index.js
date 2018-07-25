"use strict";

const path = require("path");
const util = require("util");
const _ = require("lodash");
const webpack = require("webpack");

module.exports = exports = async function(tests, dirname) {
  const fixtures = [];
  for (const [ name, input ] of tests) {
    if (/babel-|rollup-/.test(name)) continue;

    const testFnName = _.camelCase(name);
    const evalMaps = name.match(/-eval/);

    const scriptPath = path.join(path.dirname(input), "output.js");
    await runWebpack({
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
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: require.resolve("ts-loader"),
            options: {}
          }
        ].filter(Boolean)
      }
    });

    fixtures.push({
      name,
      testFnName,
      scriptPath,
      assets: [
        scriptPath,
        evalMaps ? null : scriptPath + ".map",
      ].filter(Boolean),
    });
  }

  return fixtures;
}

exports.runWebpack = runWebpack

async function runWebpack(config) {
  const result = await util.promisify(webpack)(config);

  console.log(result.toString());
}
