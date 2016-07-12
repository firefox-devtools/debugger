"use strict";

const webpackConfig = require("./webpack.config");
const webpack = require('webpack');
const getConfig = require("./config/config").getConfig;

webpackConfig.output.library = "Debugger";
webpackConfig.plugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
    },
    "DebuggerTarget": JSON.stringify("firefox-panel"),
    "DebuggerConfig": JSON.stringify(getConfig())
  })
]

module.exports = config;
