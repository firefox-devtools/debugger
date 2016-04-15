"use strict";

module.exports = function(config) {
  let configuration = {
    basePath: "",
    frameworks: ["mocha"],
    files: [
      // Uses the node test runner because babel is required
      "build/test-bundle.js"
    ],
    exclude: [],
    preprocessors: {},
    reporters: ["progress"],
    port: 8002,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    customLaunchers: {
      Chrome_travis_ci: {
        base: "Chrome",
        flags: ["--no-sandbox"]
      }
    },
    singleRun: false,
    concurrency: Infinity
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ["Chrome_travis_ci", "Firefox"];
  } else {
    config.browsers = ["Firefox", "Chrome"];
  }
  config.set(configuration);
};
