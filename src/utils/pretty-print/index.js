// @flow

const { workerUtils: { WorkerDispatcher } } = require("devtools-utils");
const { isJavaScript } = require("../source");
import assert from "../assert";

import type { Source, SourceText } from "../../types";

const dispatcher = new WorkerDispatcher();
const _prettyPrint = dispatcher.task("prettyPrint");

type PrettyPrintOpts = {
  source: Source,
  sourceText: ?SourceText,
  url: string
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
    source: sourceText ? sourceText.text : undefined
  });
}

module.exports = {
  prettyPrint,
  startPrettyPrintWorker: dispatcher.start.bind(dispatcher),
  stopPrettyPrintWorker: dispatcher.stop.bind(dispatcher)
};
