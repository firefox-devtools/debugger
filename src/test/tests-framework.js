import { startSourceMapWorker, stopSourceMapWorker } from "devtools-source-map";

import {
  startPrettyPrintWorker,
  stopPrettyPrintWorker
} from "../utils/pretty-print";

import {
  startParserWorker,
  stopParserWorker,
  clearSymbols
} from "../utils/parser";
import { startSearchWorker, stopSearchWorker } from "../utils/search";
import { getValue } from "devtools-config";
import { clearHistory } from "./utils/history";

global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

beforeAll(() => {
  startSourceMapWorker(getValue("workers.sourceMapURL"));
  startPrettyPrintWorker(getValue("workers.prettyPrintURL"));
  startParserWorker(getValue("workers.parserURL"));
  startSearchWorker(getValue("workers.searchURL"));
});

afterAll(() => {
  stopSourceMapWorker();
  stopPrettyPrintWorker();
  stopParserWorker();
  stopSearchWorker();
});

beforeEach(() => {
  clearSymbols();
  clearHistory();
});
