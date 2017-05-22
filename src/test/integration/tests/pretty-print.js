const {
  initDebugger,
  assertPausedLocation,
  waitForPaused,
  waitForDispatch,
  findSource,
  findElement,
  selectSource,
  clickElement,
  addBreakpoint,
  stepOver,
  invokeInTab,
  resume
} = require("../utils");

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
  ok(!findElement(dbg, "editorFooter"), "Footer is hidden");

  await selectSource(dbg, "math.min.js");
  ok(findElement(dbg, "editorFooter"), "Footer is hidden");
}

module.exports = prettyPrint;
