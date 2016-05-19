"use strict";

const config = require("./webpack.config");
const webpack = require('webpack');

config.output.library = "Debugger";
config.plugins.push(
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("DEVTOOLS_PANEL")
    }
  })
);

module.exports = config;
