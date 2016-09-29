"use strict";

const path = require("path");
const webpack = require('webpack');
const getConfig = require("./config/config").getConfig;
const { DefinePlugin } = webpack;

const ignoreRegexes = [
  /chrome-remote-debug-protocol/
];

const nativeMapping = {
  "public/js/utils/source-editor": "devtools/client/sourceeditor/editor",
  "public/js/test/test-flag": "devtools/shared/flags",

  // React can be required a few different ways, make sure they are
  // all mapped.
  "react": "devtools/client/shared/vendor/react",
  "devtools/client/shared/vendor/react": "devtools/client/shared/vendor/react",
  "react/lib/ReactDOM": "devtools/client/shared/vendor/react-dom"
};

module.exports = webpackConfig => {
  webpackConfig.output.library = "Debugger";

  if(process.env.MOCHITESTS) {
    webpackConfig.output.path = path.join(__dirname, "firefox/devtools/client/debugger/new");
  }

  webpackConfig.resolve.alias["public/js/utils/networkRequest"] = "public/js/utils/privilegedNetworkRequest";

  webpackConfig.externals = [
    function(context, request, callback) {
      let mod = request;
      // Only resolve relative requires
      if(mod[0] === '.') {
        mod = path.join(context.replace(__dirname + "/", ""), mod);
      }

      // Any matching paths here won't be included in the bundle.
      if(ignoreRegexes.some(r => r.test(request))) {
        callback(null, "var {}");
        return;
      } else if(nativeMapping[mod]) {
        const mapping = nativeMapping[mod];
        if(Array.isArray(mapping)) {
          callback(null, `var devtoolsRequire("${mapping[0]}")["${mapping[1]}"]`);
        }
        else {
          callback(null, `var devtoolsRequire("${mapping}")`);
        }
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
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production"),
        TARGET: JSON.stringify("firefox-panel")
      },
      "DebuggerConfig": JSON.stringify(getConfig())
    })
  ]);

  return webpackConfig;
};
