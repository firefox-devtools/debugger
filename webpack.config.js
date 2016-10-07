"use strict";

const path = require("path");
const projectPath = path.join(__dirname, "public/js");

let webpackConfig = {
  entry: {
    bundle: [path.join(projectPath, "main.js")],
    "source-map-worker": path.join(projectPath, "utils/source-map-worker.js"),
    "pretty-print-worker": path.join(projectPath, "utils/pretty-print-worker.js")
  },

  output: {
    path: path.join(__dirname, "public/build"),
    filename: "[name].js",
    publicPath: "/public/build"
  }
};

module.exports = webpackConfig;
