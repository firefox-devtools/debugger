const {
  initDebugger,
  assertPausedLocation,
  selectSource,
  addBreakpoint,
  invokeInTab,
  resume,
  waitForPaused,
  waitForDispatch,
  clickElement,
} = require("../utils");

// Tests pretty-printing a source that is currently paused.

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-minified.html");

  await selectSource(dbg, "math.min.js");
  await addBreakpoint(dbg, "math.min.js", 2);

  invokeInTab(dbg, "arithmetic");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "math.min.js", 2);

  clickElement(dbg, "prettyPrintButton");
  await waitForDispatch(dbg, "TOGGLE_PRETTY_PRINT");

  assertPausedLocation(dbg, ctx, "math.min.js:formatted", 18);

  await resume(dbg);
};
