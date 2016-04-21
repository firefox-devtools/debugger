"use strict";

module.exports = function(config) {
  const configuration = {
    basePath: "",
    frameworks: ["mocha"],
    files: [
      // Uses the node test runner because babel is required
      "build/test-bundle.js"
    ],
    exclude: [],
    preprocessors: {},
    reporters: ["progress"],
    browsers: ["Firefox", "Chrome"],
    port: 8002,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: false,
    concurrency: Infinity
  };

  config.set(configuration);
};
