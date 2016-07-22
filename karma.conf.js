"use strict";

var webpackConfig = require("./webpack.config.js");
webpackConfig.entry = {};

// Compile with babel to support older browsers. We may be able to
// remove this if we can use latest versions that have enough ES6
// support.
webpackConfig.module.loaders.forEach(spec => {
  if(spec.isJavaScriptLoader) {
    const idx = spec.loaders.findIndex(loader => loader.includes("babel"));
    spec.loaders[idx] += "&presets[]=es2015&plugins[]=transform-runtime"
  }
});

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["mocha"],
    files: [
      "./public/js/**/tests/*.js"
    ],
    exclude: [],
    reporters: ["progress"],
    browsers: ["Firefox", "Chrome"],
    port: 8002,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: false,
    concurrency: Infinity,

    preprocessors: {
      "./public/js/**/tests/*": ["webpack"]
    },

    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  });
};
