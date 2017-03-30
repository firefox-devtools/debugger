const { stopSourceMapWorker } = require("devtools-source-map");
const { stopPrettyPrintWorker } = require("../utils/pretty-print");
const { stopParserWorker } = require("../utils/parser");

export function teardownWorkers() {
  stopSourceMapWorker();
  stopPrettyPrintWorker();
  stopParserWorker();
}
