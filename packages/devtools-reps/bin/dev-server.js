/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require("path");
const toolbox = require("devtools-launchpad/index");
const feature = require("devtools-config");
const getConfig = require("./getConfig");
const serve = require("express-static");

const envConfig = getConfig();
feature.setConfig(envConfig);

let webpackConfig = require("../webpack.config");

let { app } = toolbox.startDevServer(envConfig, webpackConfig, __dirname);

// Serve devtools-reps images
app.use("/devtools-reps/images/", serve(path.join(__dirname, "../src/shared/images")));

// As well as devtools-components ones, with a different path, which we are going to
// write in the postCSS config in development mode.
app.use("/devtools-components/images/",
  serve(path.join(__dirname, "../node_modules/devtools-components/src/images")));

