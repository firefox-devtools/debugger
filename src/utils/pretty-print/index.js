// @flow

import { workerUtils } from "devtools-utils";
const { WorkerDispatcher } = workerUtils;
import { isJavaScript } from "../source";
import assert from "../assert";

import type { Source, SourceText } from "../../types";

const dispatcher = new WorkerDispatcher();
export const startPrettyPrintWorker = dispatcher.start.bind(dispatcher);
export const stopPrettyPrintWorker = dispatcher.stop.bind(dispatcher);
const _prettyPrint = dispatcher.task("prettyPrint");

type PrettyPrintOpts = {
  source: Source,
  sourceText: ?SourceText,
  url: string
};

export async function prettyPrint({
  source,
  sourceText,
  url
}: PrettyPrintOpts) {
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
