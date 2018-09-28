/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { readFileSync } from "fs";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { setupHelper } from "../utils/dbg";
import { prefs } from "../utils/prefs";

import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";

import {
  start as startPrettyPrintWorker,
  stop as stopPrettyPrintWorker
} from "../workers/pretty-print";

import {
  start as startParserWorker,
  stop as stopParserWorker,
  clearSymbols,
  clearASTs
} from "../workers/parser";
import {
  start as startSearchWorker,
  stop as stopSearchWorker
} from "../workers/search";
import { clearDocuments } from "../utils/editor";
import { clearHistory } from "./utils/history";

import env from "devtools-environment/test-flag";
env.testing = true;

const rootPath = path.join(__dirname, "../../");

global.DebuggerConfig = getConfig();
global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(
  readFileSync(path.join(__dirname, "../../assets/panel/debugger.properties"))
);
global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
global.performance = { now: () => 0 };

const { URL } = require("url");
global.URL = URL;

global.indexedDB = mockIndexeddDB();

Enzyme.configure({ adapter: new Adapter() });

function formatException(reason, p) {
  console && console.log("Unhandled Rejection at:", p, "reason:", reason);
}

beforeAll(() => {
  startSourceMapWorker(
    path.join(rootPath, "node_modules/devtools-source-map/src/worker.js")
  );
  startPrettyPrintWorker(
    path.join(rootPath, "src/workers/pretty-print/worker.js")
  );
  startParserWorker(path.join(rootPath, "src/workers/parser/worker.js"));
  startSearchWorker(path.join(rootPath, "src/workers/search/worker.js"));
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

beforeEach(async () => {
  clearASTs();
  await clearSymbols();
  clearHistory();
  clearDocuments();
  prefs.projectDirectoryRoot = "";

  // Ensures window.dbg is there to track telemetry
  setupHelper({ selectors: {} });
});

function mockIndexeddDB() {
  const store = {};
  return {
    open: () => ({}),
    getItem: async key => store[key],
    setItem: async (key, value) => {
      store[key] = value;
    }
  };
}
