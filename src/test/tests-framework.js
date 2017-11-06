/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
