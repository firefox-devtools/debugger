// @flow

const { getValue } = require("devtools-config");
const { workerUtils: { workerTask } } = require("devtools-modules");
const { isJavaScript } = require("../source");
const assert = require("../assert");

import type { Source, SourceText } from "../../types";

let prettyPrintWorker = new Worker(getValue("workers.prettyPrintURL"));

function destroyWorker() {
  if (prettyPrintWorker != null) {
    prettyPrintWorker.terminate();
    prettyPrintWorker = null;
  }
}

const _prettyPrint = workerTask(prettyPrintWorker, "prettyPrint");

type PrettyPrintOpts = {
  source: Source,
  sourceText: ?SourceText,
  url: string,
};

async function prettyPrint({ source, sourceText, url }: PrettyPrintOpts) {
  const contentType = sourceText ? sourceText.contentType : "";
  const indent = 2;

  assert(
    isJavaScript(source.url, contentType),
    "Can't prettify non-javascript files."
  );

  return await _prettyPrint({
    url,
    indent,
    source: sourceText ? sourceText.text : undefined,
  });
}

module.exports = {
  prettyPrint,
  destroyWorker,
};
