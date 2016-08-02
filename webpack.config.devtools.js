"use strict";

const webpack = require('webpack');
const getConfig = require("./config/config").getConfig;
const { DefinePlugin } = webpack;

const ignoreRegexes = [
  /chrome-remote-debug-protocol/
];

module.exports = webpackConfig => {
  webpackConfig.output.library = "Debugger";
  webpackConfig.externals = [
    function(context, request, callback) {
      // Any matching paths here won't be included in the bundle.
      if(ignoreRegexes.some(r => r.test(request))) {
        callback(null, "var {}");
        return;
      }
      callback();
    }
  ];

  // Remove the existing DefinePlugin so we can override it.
  const plugins = webpackConfig.plugins.filter(p => !(p instanceof DefinePlugin));
  webpackConfig.plugins = plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
      "DebuggerTarget": JSON.stringify("firefox-panel"),
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]);

  return webpackConfig;
};
