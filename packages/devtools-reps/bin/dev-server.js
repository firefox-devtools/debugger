/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require("path");
const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const serve = require("express-static");

feature.setConfig({
  "title": "Reps",
  "hotReloading": true,
  "defaultURL": "https://nchevobbe.github.io/demo/console-test-app.html",
  "environment": "development",
  "logging": {
    "client": false,
    "firefoxProxy": false,
    "actions": false
  },
  "theme": "light",
  "firefox": {
    "webSocketConnection": false,
    "host": "localhost",
    "webSocketPort": 9000,
    "tcpPort": 6080,
    "mcPath": "./firefox"
  },
  "development": {
    "serverPort": 8000
  },
  "features": {}
});

let webpackConfig = require("../webpack.config");

let { app } = toolbox.startDevServer(envConfig, webpackConfig, __dirname);

// Serve devtools-reps images
app.use(
  "/devtools-reps/images/",
  serve(path.join(__dirname, "../src/shared/images"))
);

// As well as devtools-components ones, with a different path, which we are going to
// write in the postCSS config in development mode.
app.use(
  "/devtools-components/images/",
  serve(path.join(__dirname, "../node_modules/devtools-components/src/images"))
);
