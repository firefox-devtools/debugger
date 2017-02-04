const { waitForPaused, waitForDispatch } = require("../utils/wait");
const { findSource, findElement } = require("../utils/shared");

const {
  selectSource,
  clickElement,
  addBreakpoint,
  stepOver,
  invokeInTab,
  resume
} = require("../utils/commands");

const { assertPausedLocation } = require("../utils/assert");

const { setupTestRunner, initDebugger } = require("../utils/mocha")

async function prettyPrint(ctx) {
  const { ok, is } = ctx;
  const dbg = await initDebugger("doc-minified.html", "math.min");

  await selectSource(dbg, "math.min.js");

  clickElement(dbg, "prettyPrintButton");
  await waitForDispatch(dbg, "TOGGLE_PRETTY_PRINT");

  const ppSrc = findSource(dbg, "math.min.js:formatted");
  ok(ppSrc, "Pretty-printed source exists");

  await addBreakpoint(dbg, ppSrc, 18);

  invokeInTab(dbg, "arithmetic");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, ppSrc, 18);

  await stepOver(dbg);
  assertPausedLocation(dbg, ctx, ppSrc, 27);
  await resume(dbg);

  // The pretty-print button should go away in the pretty-printed
  // source.
  ok(!findElement(dbg, "sourceFooter"), "Footer is hidden");

  await selectSource(dbg, "math.min.js");
  ok(findElement(dbg, "sourceFooter"), "Footer is hidden");
}

module.exports = prettyPrint;
