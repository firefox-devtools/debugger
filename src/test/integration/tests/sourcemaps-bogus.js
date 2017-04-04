const {
  initDebugger,
  countSources,
  assertPausedLocation,
  selectSource,
  addBreakpoint,
  invokeInTab,
  waitForPaused
} = require("../utils");

// Test that an error while loading a sourcemap does not break
// debugging.

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-sourcemap-bogus.html");
  const { selectors: { getSources }, getState } = dbg;

  await selectSource(dbg, "bogus-map.js");

  // We should still be able to set breakpoints and pause in the
  // generated source.
  await addBreakpoint(dbg, "bogus-map.js", 4);
  invokeInTab(dbg, "runCode");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "bogus-map.js", 4);

  // Make sure that only the single generated source exists. The
  // sourcemap failed to download.
  is(countSources(dbg), 1, "Only 1 source exists");
};
