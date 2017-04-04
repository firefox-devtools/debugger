const {
  initDebugger,
  assertPausedLocation,
  findSource,
  waitForSources,
  selectSource,
  addBreakpoint,
  invokeInTab,
  waitForPaused
} = require("../utils");

// Tests loading sourcemapped sources, setting breakpoints, and
// stepping in them.

// This source map does not have source contents, so it's fetched separately

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger("doc-sourcemaps2.html");
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  await waitForSources(dbg, "main.js", "main.min.js");

  ok(true, "Original sources exist");
  const mainSrc = findSource(dbg, "main.js");

  await selectSource(dbg, mainSrc);

  // Test that breakpoint is not off by a line.
  await addBreakpoint(dbg, mainSrc, 4);
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(
    getBreakpoint(getState(), { sourceId: mainSrc.id, line: 4 }),
    "Breakpoint has correct line"
  );

  invokeInTab(dbg, "logMessage");

  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "main.js", 4);
};
