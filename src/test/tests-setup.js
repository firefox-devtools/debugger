/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { setConfig, getValue } from "devtools-config";
import { readFileSync } from "fs";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";

import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../workers/pretty-print";

import {
  startParserWorker,
  stopParserWorker,
  clearSymbols,
  clearASTs
} from "../workers/parser";
import { startSearchWorker, stopSearchWorker } from "../workers/search";
import { clearDocuments } from "../utils/editor";
import { clearHistory } from "./utils/history";

const rootPath = path.join(__dirname, "../../");

const envConfig = getConfig();
const config = {
  ...envConfig,
  workers: {
    sourceMapURL: path.join(
      rootPath,
      "node_modules/devtools-source-map/src/worker.js"
    ),
    parserURL: path.join(rootPath, "src/workers/parser/worker.js"),
    prettyPrintURL: path.join(rootPath, "src/workers/pretty-print/worker.js"),
    searchURL: path.join(rootPath, "src/workers/search/worker.js")
  }
};

global.DebuggerConfig = config;
global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(
  readFileSync(path.join(__dirname, "../../assets/panel/debugger.properties"))
);
global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
global.performance = { now: () => 0 };

Enzyme.configure({ adapter: new Adapter() });

setConfig(config);

function formatException(reason, p) {
  console && console.log("Unhandled Rejection at:", p, "reason:", reason);
}

beforeAll(() => {
  startSourceMapWorker(getValue("workers.sourceMapURL"));
  startPrettyPrintWorker(getValue("workers.prettyPrintURL"));
  startParserWorker(getValue("workers.parserURL"));
  startSearchWorker(getValue("workers.searchURL"));
  process.on("unhandledRejection", formatException);
});

afterAll(() => {
  stopSourceMapWorker();
  stopPrettyPrintWorker();
  stopParserWorker();
  stopSearchWorker();
  process.removeListener("unhandledRejection", formatException);
});

afterEach(() => {});

beforeEach(() => {
  clearASTs();
  clearSymbols();
  clearHistory();
  clearDocuments();
});
