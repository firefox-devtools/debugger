const { getValue } = require("devtools-config");
const { workerTask } = require("./utils");
const { isJavaScript } = require("./source");
const assert = require("./assert");

let prettyPrintWorker = new Worker(
  getValue("baseWorkerURL") + "pretty-print-worker.js"
);

function destroyWorker() {
  prettyPrintWorker.terminate();
  prettyPrintWorker = null;
}

const _prettyPrint = workerTask(prettyPrintWorker, "prettyPrint");

async function prettyPrint({ source, sourceText, url }) {
  const contentType = sourceText ? sourceText.contentType : null;
  const indent = 2;

  assert(
    isJavaScript(source.url, contentType),
    "Can't prettify non-javascript files."
  );

  return await _prettyPrint({
    url,
    indent,
    source: sourceText.text
  });
}

module.exports = {
  prettyPrint,
  destroyWorker
};
