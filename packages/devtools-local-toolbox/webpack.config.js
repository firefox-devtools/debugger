
require("babel-register");

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { isDevelopment, isFirefoxPanel, getValue } = require("devtools-config");
const merge = require("lodash/merge");
const NODE_ENV = process.env.NODE_ENV || "development";
const TARGET = process.env.TARGET || "local";

const defaultBabelPlugins = [
  "transform-flow-strip-types",
  "transform-async-to-generator"
];

module.exports = (webpackConfig, envConfig) => {
  webpackConfig.context = path.resolve(__dirname, "src");
  webpackConfig.devtool = "source-map";

  webpackConfig.resolve = merge({
    alias: {
      "devtools/client/shared/vendor/react": "react",
      "devtools/client/shared/vendor/react-dom": "react-dom"
    }
  }, webpackConfig.resolve);

  webpackConfig.module = {
    loaders: [
    { test: /\.json$/,
      loader: "json" },
    { test: /\.js$/,
      exclude: request => {
        return request.match(/(node_modules|bower_components|fs)/)
               && !request.match(/devtools-local-toolbox\/src/);
      },
      loaders: [
        "babel?" +
          defaultBabelPlugins.map(p => "plugins[]=" + p) +
          "&ignore=src/lib"
      ],
      isJavaScriptLoader: true
    },
    { test: /\.svg$/,
      exclude: /lkdjlskdjslkdjsdlk/,
      loader: "svg-inline" }
    ]
  };

  const ignoreRegexes = [/^fs$/];
  webpackConfig.externals = [];
  function externalsTest(context, request, callback) {
    let mod = request;

    // Any matching paths here won't be included in the bundle.
    if (ignoreRegexes.some(r => r.test(request))) {
      return callback(null, "var {}");
    }

    callback();
  }
  webpackConfig.externals.push(externalsTest);

  webpackConfig.plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(NODE_ENV),
        TARGET: JSON.stringify(TARGET)
      },
      "DebuggerConfig": JSON.stringify(envConfig)
    })
  ];

  if (isDevelopment()) {
    webpackConfig.module.loaders.push({
      test: /\.css$/,
      exclude: /lkjsdflksdjlksdj/,
      loader: "style!css"
    });

    if (getValue("hotReloading")) {
      webpackConfig.entry.bundle.push("webpack-hot-middleware/client");

      webpackConfig.plugins = webpackConfig.plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ]);

      webpackConfig.module.loaders.forEach(spec => {
        if (spec.isJavaScriptLoader) {
          spec.loaders.unshift("react-hot");
        }
      });
    }
  } else {
  // Extract CSS into a single file
    webpackConfig.module.loaders.push({
      test: /\.css$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader")
    });

    webpackConfig.plugins.push(new ExtractTextPlugin("styles.css"));
  }

  if (isFirefoxPanel()) {
    webpackConfig = require("./webpack.config.devtools")(webpackConfig, envConfig);
  }

  // NOTE: This is only needed to fix a bug with chrome devtools' debugger and
  // destructuring params https://github.com/devtools-html/debugger.html/issues/67
  if (getValue("transformParameters")) {
    webpackConfig.module.loaders.forEach(spec => {
      if (spec.isJavaScriptLoader) {
        const idx = spec.loaders.findIndex(loader => loader.includes("babel"));
        spec.loaders[idx] += "&plugins[]=transform-es2015-parameters";
      }
    });
  }

  return webpackConfig;
};
