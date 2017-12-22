import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";

import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../workers/pretty-print";

import {
  startParserWorker,
  stopParserWorker,
  clearSymbols
} from "../workers/parser";
import { startSearchWorker, stopSearchWorker } from "../workers/search";
import { getValue } from "devtools-config";
import { clearHistory } from "./utils/history";

global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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

beforeEach(() => {
  clearSymbols();
  clearHistory();
});
