"use strict";

const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "devtools": "ff-devtools-libs",
      "sdk": "ff-devtools-libs/sdk"
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.json$/, loader: "json-loader" },
    ]
  }
};
