/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { setConfig } from "devtools-config";
import { readFileSync } from "fs";
const rootPath = path.join(__dirname, "../../");

const envConfig = getConfig();
const config = Object.assign({}, envConfig, {
  workers: {
    sourceMapURL: path.join(
      rootPath,
      "node_modules/devtools-source-map/src/worker.js"
    ),
    parserURL: path.join(rootPath, "src/workers/parser/worker.js"),
    prettyPrintURL: path.join(rootPath, "src/workers/pretty-print/worker.js"),
    searchURL: path.join(rootPath, "src/workers/search/worker.js")
  }
});

global.DebuggerConfig = config;

global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(readFileSync("./assets/panel/debugger.properties"));

setConfig(config);

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at:", p, "reason:", reason);
});
