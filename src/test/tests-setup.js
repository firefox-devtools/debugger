global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { setConfig } from "devtools-config";
import { readFileSync } from "fs";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-15";

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
import { getValue } from "devtools-config";
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
global.L10N.setBundle(readFileSync("./assets/panel/debugger.properties"));

Enzyme.configure({ adapter: new Adapter() });

setConfig(config);

global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
global.performance = { now: () => 0 };

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
