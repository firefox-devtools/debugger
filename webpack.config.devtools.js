"use strict";

const path = require("path");
const webpack = require('webpack');
const getConfig = require("./config/config").getConfig;
const { DefinePlugin } = webpack;

const ignoreRegexes = [
  /chrome-remote-debug-protocol/
];

const nativeMapping = {
  // Don't map this until bug 1295318 lands
  // "public/js/utils/source-editor": "devtools/client/sourceeditor/editor"
};

module.exports = webpackConfig => {
  webpackConfig.output.library = "Debugger";
  webpackConfig.externals = [
    function(context, request, callback) {
      const mod = path.join(context.replace(__dirname + "/", ""), request);

      // Any matching paths here won't be included in the bundle.
      if(ignoreRegexes.some(r => r.test(request))) {
        callback(null, "var {}");
        return;
      } else if(nativeMapping[mod]) {
        callback(null, "var devtoolsRequire('" + nativeMapping[mod] + "')");
        return;
      }
      callback();
    },

    { codemirror: "var devtoolsRequire('devtools/client/sourceeditor/editor')" }
  ];

  // Remove the existing DefinePlugin so we can override it.
  const plugins = webpackConfig.plugins.filter(p => !(p instanceof DefinePlugin));
  webpackConfig.plugins = plugins.concat([
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production"),
        TARGET: JSON.stringify("firefox-panel")
      },
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]);

  return webpackConfig;
};
