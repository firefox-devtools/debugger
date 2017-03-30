const {
  startSourceMapWorker,
  stopSourceMapWorker,
} = require("devtools-source-map");

const {
  startPrettyPrintWorker,
  stopPrettyPrintWorker,
} = require("../utils/pretty-print");

const {
  startParserWorker,
  stopParserWorker,
} = require("../utils/parser");

const { getValue } = require("devtools-config");

beforeAll(() => {
  startSourceMapWorker(getValue("workers.sourceMapURL"));
  startPrettyPrintWorker(getValue("workers.prettyPrintURL"));
  startParserWorker(getValue("workers.parserURL"));
});

afterAll(() => {
  stopSourceMapWorker();
  stopPrettyPrintWorker();
  stopParserWorker();
});
